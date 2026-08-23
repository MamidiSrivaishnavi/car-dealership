// Applies the schema to the test database (file:./test.db relative to prisma/)
const path = require('path');
const envPath = path.resolve(__dirname, '../../.env.test');
require('dotenv').config({ path: envPath, override: true });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "email" TEXT NOT NULL,
      "password" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'USER',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Vehicle" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "make" TEXT NOT NULL,
      "model" TEXT NOT NULL,
      "category" TEXT NOT NULL,
      "price" REAL NOT NULL,
      "quantity" INTEGER NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    )
  `);
  console.log('Test database schema applied. DATABASE_URL =', process.env.DATABASE_URL);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
