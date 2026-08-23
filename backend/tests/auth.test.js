const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/database');

beforeEach(async () => {
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('POST /api/auth/register', () => {
  it('registers a new user and returns 201 with user data', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user.role).toBe('USER');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('hashes the password — plain text must not be stored', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      password: 'password123',
    });

    const userInDb = await prisma.user.findUnique({ where: { email: 'test@example.com' } });
    expect(userInDb.password).not.toBe('password123');
    expect(userInDb.password).toMatch(/^\$2[ab]\$/);
  });

  it('returns 409 when email is already registered', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      password: 'password123',
    });

    const res = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      password: 'anotherpassword',
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already registered/i);
  });

  it('returns 400 when email is missing', async () => {
    const res = await request(app).post('/api/auth/register').send({
      password: 'password123',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });

  it('returns 400 when password is missing', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/password/i);
  });

  it('returns 400 when email format is invalid', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'not-an-email',
      password: 'password123',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });

  it('returns 400 when password is too short', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      password: '123',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/password/i);
  });
});
