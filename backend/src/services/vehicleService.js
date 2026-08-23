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

async function updateVehicle(id, data) {
  const existing = await prisma.vehicle.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Vehicle not found');
    error.status = 404;
    throw error;
  }
  return prisma.vehicle.update({ where: { id }, data });
}

async function deleteVehicle(id) {
  const existing = await prisma.vehicle.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Vehicle not found');
    error.status = 404;
    throw error;
  }
  return prisma.vehicle.delete({ where: { id } });
}

async function purchaseVehicle(id) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) {
    const error = new Error('Vehicle not found');
    error.status = 404;
    throw error;
  }
  if (vehicle.quantity === 0) {
    const error = new Error('Out of stock');
    error.status = 400;
    throw error;
  }
  return prisma.vehicle.update({ where: { id }, data: { quantity: vehicle.quantity - 1 } });
}

async function restockVehicle(id, quantity) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) {
    const error = new Error('Vehicle not found');
    error.status = 404;
    throw error;
  }
  return prisma.vehicle.update({ where: { id }, data: { quantity: vehicle.quantity + quantity } });
}

module.exports = { createVehicle, getAllVehicles, searchVehicles, updateVehicle, deleteVehicle, purchaseVehicle, restockVehicle };
