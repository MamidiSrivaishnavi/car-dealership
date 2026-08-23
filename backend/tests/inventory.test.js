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
    data: { email: 'admin@inventory.com', password: hashedPassword, role: 'ADMIN' },
  });
  const user = await prisma.user.create({
    data: { email: 'user@inventory.com', password: hashedPassword, role: 'USER' },
  });

  adminToken = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  userToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  await prisma.purchase.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('POST /api/vehicles/:id/purchase', () => {
  let vehicleId;

  beforeEach(async () => {
    await prisma.purchase.deleteMany();
    await prisma.vehicle.deleteMany();
    const vehicle = await prisma.vehicle.create({
      data: { make: 'Toyota', model: 'Camry', category: 'Sedan', price: 25000, quantity: 5, updatedAt: new Date() },
    });
    vehicleId = vehicle.id;
  });

  it('authenticated USER can purchase a vehicle and returns 200', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/purchased/i);
  });

  it('purchase decreases stock quantity by 1', async () => {
    await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`);

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    expect(vehicle.quantity).toBe(4);
  });

  it('ADMIN can also purchase a vehicle', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`);

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/unauthorized/i);
  });

  it('returns 404 when vehicle does not exist', async () => {
    const res = await request(app)
      .post('/api/vehicles/999999/purchase')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('returns 400 when stock is 0 — cannot purchase out-of-stock vehicle', async () => {
    await prisma.vehicle.update({ where: { id: vehicleId }, data: { quantity: 0 } });

    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/out of stock/i);
  });

  it('multiple purchases correctly decrement stock each time', async () => {
    await request(app).post(`/api/vehicles/${vehicleId}/purchase`).set('Authorization', `Bearer ${userToken}`);
    await request(app).post(`/api/vehicles/${vehicleId}/purchase`).set('Authorization', `Bearer ${userToken}`);
    await request(app).post(`/api/vehicles/${vehicleId}/purchase`).set('Authorization', `Bearer ${userToken}`);

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    expect(vehicle.quantity).toBe(2);
  });

  it('stock cannot go below 0', async () => {
    await prisma.vehicle.update({ where: { id: vehicleId }, data: { quantity: 1 } });

    await request(app).post(`/api/vehicles/${vehicleId}/purchase`).set('Authorization', `Bearer ${userToken}`);
    const res = await request(app).post(`/api/vehicles/${vehicleId}/purchase`).set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/out of stock/i);

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    expect(vehicle.quantity).toBe(0);
  });
});

describe('POST /api/vehicles/:id/restock', () => {
  let vehicleId;

  beforeEach(async () => {
    await prisma.purchase.deleteMany();
    await prisma.vehicle.deleteMany();
    const vehicle = await prisma.vehicle.create({
      data: { make: 'Toyota', model: 'Camry', category: 'Sedan', price: 25000, quantity: 2, updatedAt: new Date() },
    });
    vehicleId = vehicle.id;
  });

  it('ADMIN can restock a vehicle and returns 200', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 10 });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/restocked/i);
  });

  it('restock increases stock by the specified quantity', async () => {
    await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 10 });

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    expect(vehicle.quantity).toBe(12);
  });

  it('returns 403 when USER tries to restock', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 10 });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/forbidden/i);
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .send({ quantity: 10 });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/unauthorized/i);
  });

  it('returns 404 when vehicle does not exist', async () => {
    const res = await request(app)
      .post('/api/vehicles/999999/restock')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 10 });

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('returns 400 when restock quantity is missing', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/quantity/i);
  });

  it('returns 400 when restock quantity is zero or negative', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 0 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/quantity/i);
  });
});
