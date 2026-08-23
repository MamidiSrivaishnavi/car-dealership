const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/database');

let adminToken;
let userToken;
let vehicleId;

beforeAll(async () => {
  await prisma.user.deleteMany();
  await prisma.vehicle.deleteMany();

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

beforeEach(async () => {
  await prisma.vehicle.deleteMany();
  const vehicle = await prisma.vehicle.create({
    data: { make: 'Toyota', model: 'Camry', category: 'Sedan', price: 25000, quantity: 10, updatedAt: new Date() },
  });
  vehicleId = vehicle.id;
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

describe('GET /api/vehicles', () => {
  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/vehicles');

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/unauthorized/i);
  });

  it('returns empty array when no vehicles exist', async () => {
    await prisma.vehicle.deleteMany();
    const res = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.vehicles).toEqual([]);
  });

  it('authenticated USER can list all vehicles', async () => {
    await prisma.vehicle.createMany({
      data: [
        { make: 'Toyota', model: 'Camry', category: 'Sedan', price: 25000, quantity: 5, updatedAt: new Date() },
        { make: 'Honda', model: 'Civic', category: 'Sedan', price: 22000, quantity: 3, updatedAt: new Date() },
      ],
    });

    const res = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.vehicles.length).toBeGreaterThanOrEqual(2);
  });

  it('authenticated ADMIN can list all vehicles', async () => {
    const res = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.vehicles)).toBe(true);
  });

  it('returned vehicles contain the required fields', async () => {
    const res = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`);

    const vehicle = res.body.vehicles[0];
    expect(vehicle).toHaveProperty('id');
    expect(vehicle).toHaveProperty('make');
    expect(vehicle).toHaveProperty('model');
    expect(vehicle).toHaveProperty('category');
    expect(vehicle).toHaveProperty('price');
    expect(vehicle).toHaveProperty('quantity');
  });
});

describe('PUT /api/vehicles/:id', () => {
  const updatedData = {
    make: 'Honda',
    model: 'Accord',
    category: 'Sedan',
    price: 30000,
    quantity: 7,
  };

  it('ADMIN can update a vehicle and returns 200', async () => {
    const res = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updatedData);

    expect(res.status).toBe(200);
    expect(res.body.vehicle.make).toBe('Honda');
    expect(res.body.vehicle.model).toBe('Accord');
    expect(res.body.vehicle.price).toBe(30000);
    expect(res.body.vehicle.quantity).toBe(7);
  });

  it('updated vehicle is persisted in the database', async () => {
    await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updatedData);

    const vehicleInDb = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    expect(vehicleInDb.make).toBe('Honda');
    expect(vehicleInDb.model).toBe('Accord');
  });

  it('returns 403 when USER tries to update a vehicle', async () => {
    const res = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(updatedData);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/forbidden/i);
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .send(updatedData);

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/unauthorized/i);
  });

  it('returns 404 when vehicle does not exist', async () => {
    const res = await request(app)
      .put('/api/vehicles/999999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updatedData);

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('returns 400 when price is negative', async () => {
    const res = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...updatedData, price: -500 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/price/i);
  });

  it('returns 400 when make is missing', async () => {
    const res = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ model: 'Accord', category: 'Sedan', price: 30000, quantity: 7 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/make/i);
  });
});
