const bcrypt = require('bcryptjs');
const prisma = require('../config/database');

async function registerUser({ email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const error = new Error('Email already registered');
    error.status = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
    select: { id: true, email: true, role: true, createdAt: true },
  });

  return user;
}

module.exports = { registerUser };
