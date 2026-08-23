const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

let userToken;
let userId;
let vehicleId;

beforeAll(async () => {
  await prisma.purchase.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  const hashed = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: { email: 'buyer@example.com', password: hashed, role: 'USER' },
  });
  userId = user.id;
  userToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  const vehicle = await prisma.vehicle.create({
    data: { make: 'BMW', model: 'X5', category: 'SUV', price: 75000, quantity: 5, updatedAt: new Date() },
  });
  vehicleId = vehicle.id;
});

afterAll(async () => {
  await prisma.purchase.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('POST /api/vehicles/:id/purchase', () => {
  it('creates a purchase record and decrements stock', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/purchased/i);

    const purchase = await prisma.purchase.findFirst({ where: { userId, vehicleId } });
    expect(purchase).not.toBeNull();
    expect(purchase.price).toBe(75000);

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    expect(vehicle.quantity).toBe(4);
  });

  it('returns 400 when out of stock', async () => {
    await prisma.vehicle.update({ where: { id: vehicleId }, data: { quantity: 0 } });

    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/out of stock/i);

    // restore
    await prisma.vehicle.update({ where: { id: vehicleId }, data: { quantity: 5 } });
  });

  it('returns 401 when unauthenticated', async () => {
    const res = await request(app).post(`/api/vehicles/${vehicleId}/purchase`);
    expect(res.status).toBe(401);
  });
});

describe('GET /api/vehicles/my-purchases', () => {
  beforeAll(async () => {
    await prisma.purchase.deleteMany();
    await prisma.vehicle.update({ where: { id: vehicleId }, data: { quantity: 5 } });
    // create two purchases
    await prisma.purchase.createMany({
      data: [
        { userId, vehicleId, price: 75000 },
        { userId, vehicleId, price: 75000 },
      ],
    });
  });

  it('returns the authenticated user\'s purchase history', async () => {
    const res = await request(app)
      .get('/api/vehicles/my-purchases')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.purchases).toHaveLength(2);
    expect(res.body.purchases[0]).toHaveProperty('price', 75000);
    expect(res.body.purchases[0].vehicle).toMatchObject({ make: 'BMW', model: 'X5' });
  });

  it('returns 401 when unauthenticated', async () => {
    const res = await request(app).get('/api/vehicles/my-purchases');
    expect(res.status).toBe(401);
  });

  it('returns empty array when user has no purchases', async () => {
    const hashed = await bcrypt.hash('pass', 10);
    const other = await prisma.user.create({ data: { email: 'other@example.com', password: hashed } });
    const otherToken = jwt.sign({ id: other.id, role: other.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const res = await request(app)
      .get('/api/vehicles/my-purchases')
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(200);
    expect(res.body.purchases).toEqual([]);
  });
});
