const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/database');

let adminToken;
let userToken;

beforeAll(async () => {
  await prisma.user.deleteMany();
  await prisma.vehicle.deleteMany();

  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: { email: 'admin@search.com', password: hashedPassword, role: 'ADMIN' },
  });
  const user = await prisma.user.create({
    data: { email: 'user@search.com', password: hashedPassword, role: 'USER' },
  });

  adminToken = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  userToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  await prisma.vehicle.createMany({
    data: [
      { make: 'Toyota', model: 'Camry',   category: 'Sedan', price: 25000, quantity: 5, updatedAt: new Date() },
      { make: 'Toyota', model: 'RAV4',    category: 'SUV',   price: 35000, quantity: 3, updatedAt: new Date() },
      { make: 'Honda',  model: 'Civic',   category: 'Sedan', price: 22000, quantity: 8, updatedAt: new Date() },
      { make: 'Ford',   model: 'F-150',   category: 'Truck', price: 45000, quantity: 2, updatedAt: new Date() },
      { make: 'BMW',    model: 'X5',      category: 'SUV',   price: 65000, quantity: 1, updatedAt: new Date() },
    ],
  });
});

afterAll(async () => {
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('GET /api/vehicles/search', () => {
  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/vehicles/search');
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/unauthorized/i);
  });

  it('authenticated USER can search vehicles', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?make=Toyota')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.vehicles)).toBe(true);
  });

  it('authenticated ADMIN can search vehicles', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?make=Toyota')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.vehicles)).toBe(true);
  });

  it('filters by make', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?make=Toyota')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.vehicles).toHaveLength(2);
    res.body.vehicles.forEach(v => expect(v.make).toBe('Toyota'));
  });

  it('filters by model', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?model=Civic')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.vehicles).toHaveLength(1);
    expect(res.body.vehicles[0].model).toBe('Civic');
  });

  it('filters by category', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?category=SUV')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.vehicles).toHaveLength(2);
    res.body.vehicles.forEach(v => expect(v.category).toBe('SUV'));
  });

  it('filters by minPrice', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?minPrice=40000')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.vehicles).toHaveLength(2);
    res.body.vehicles.forEach(v => expect(v.price).toBeGreaterThanOrEqual(40000));
  });

  it('filters by maxPrice', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?maxPrice=25000')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.vehicles).toHaveLength(2);
    res.body.vehicles.forEach(v => expect(v.price).toBeLessThanOrEqual(25000));
  });

  it('combines multiple filters', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?make=Toyota&category=SUV')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.vehicles).toHaveLength(1);
    expect(res.body.vehicles[0].model).toBe('RAV4');
  });

  it('returns empty array when no vehicles match', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?make=Ferrari')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.vehicles).toEqual([]);
  });
});
