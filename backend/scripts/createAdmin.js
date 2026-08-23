#!/usr/bin/env node
// Usage: node scripts/createAdmin.js <email> <password>
// Creates or promotes a user to ADMIN role.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const [,, email, password] = process.argv;
if (!email || !password) {
  console.error('Usage: node scripts/createAdmin.js <email> <password>');
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({ where: { email }, data: { role: 'ADMIN' } });
    console.log(`Promoted existing user "${email}" to ADMIN.`);
  } else {
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { email, password: hashed, role: 'ADMIN' } });
    console.log(`Created new ADMIN user "${email}".`);
  }
}

main().catch((e) => { console.error(e.message); process.exit(1); }).finally(() => prisma.$disconnect());
