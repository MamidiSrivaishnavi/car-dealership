const prisma = require('../config/database');

async function createVehicle(data) {
  return prisma.vehicle.create({ data });
}

async function getAllVehicles() {
  return prisma.vehicle.findMany();
}

async function searchVehicles({ make, model, category, minPrice, maxPrice }) {
  const where = {};
  if (make) where.make = make;
  if (model) where.model = model;
  if (category) where.category = category;
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }
  return prisma.vehicle.findMany({ where });
}

module.exports = { createVehicle, getAllVehicles, searchVehicles };
