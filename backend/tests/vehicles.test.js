const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/database');

let adminToken;
let userToken;

beforeAll(async () => {
  await prisma.user.deleteMany();
  await prisma.vehicle.deleteMany();

  // Create admin user directly with known role
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: { email: 'admin@example.com', password: hashedPassword, role: 'ADMIN' },
  });
  const user = await prisma.user.create({
    data: { email: 'user@example.com', password: hashedPassword, role: 'USER' },
  });

  adminToken = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  userToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('POST /api/vehicles', () => {
  const validVehicle = {
    make: 'Toyota',
    model: 'Camry',
    category: 'Sedan',
    price: 25000,
    quantity: 10,
  };

  it('admin can create a vehicle and returns 201', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validVehicle);

    expect(res.status).toBe(201);
    expect(res.body.vehicle.make).toBe('Toyota');
    expect(res.body.vehicle.model).toBe('Camry');
    expect(res.body.vehicle.category).toBe('Sedan');
    expect(res.body.vehicle.price).toBe(25000);
    expect(res.body.vehicle.quantity).toBe(10);
    expect(res.body.vehicle.id).toBeDefined();
  });

  it('created vehicle is persisted in the database', async () => {
    await prisma.vehicle.deleteMany();

    await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validVehicle);

    const vehicleInDb = await prisma.vehicle.findFirst({ where: { make: 'Toyota' } });
    expect(vehicleInDb).not.toBeNull();
    expect(vehicleInDb.model).toBe('Camry');
  });

  it('returns 403 when a normal USER tries to create a vehicle', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send(validVehicle);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/forbidden/i);
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .send(validVehicle);

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/unauthorized/i);
  });

  it('returns 400 when make is missing', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ model: 'Camry', category: 'Sedan', price: 25000, quantity: 10 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/make/i);
  });

  it('returns 400 when price is negative', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validVehicle, price: -100 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/price/i);
  });

  it('returns 400 when quantity is negative', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validVehicle, quantity: -5 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/quantity/i);
  });
});
