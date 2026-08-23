const prisma = require('../config/database');

async function createVehicle(data) {
  return prisma.vehicle.create({ data });
}

module.exports = { createVehicle };
