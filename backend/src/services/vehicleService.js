const prisma = require('../config/database');

async function createVehicle(data) {
  return prisma.vehicle.create({ data });
}

async function getAllVehicles() {
  return prisma.vehicle.findMany();
}

module.exports = { createVehicle, getAllVehicles };
