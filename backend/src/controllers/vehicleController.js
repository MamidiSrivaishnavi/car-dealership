const { createVehicle, getAllVehicles, searchVehicles, updateVehicle, deleteVehicle, purchaseVehicle, restockVehicle } = require('../services/vehicleService');
const { validateVehicle } = require('../validators/vehicleValidator');

async function create(req, res) {
  const validationError = validateVehicle(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  try {
    const { make, model, category, price, quantity } = req.body;
    const vehicle = await createVehicle({ make, model, category, price, quantity });
    return res.status(201).json({ vehicle });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function list(req, res) {
  try {
    const vehicles = await getAllVehicles();
    return res.status(200).json({ vehicles });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function search(req, res) {
  try {
    const { make, model, category, minPrice, maxPrice } = req.query;
    const vehicles = await searchVehicles({
      make,
      model,
      category,
      minPrice: minPrice !== undefined ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice !== undefined ? parseFloat(maxPrice) : undefined,
    });
    return res.status(200).json({ vehicles });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function update(req, res) {
  const validationError = validateVehicle(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  try {
    const id = parseInt(req.params.id);
    const { make, model, category, price, quantity } = req.body;
    const vehicle = await updateVehicle(id, { make, model, category, price, quantity });
    return res.status(200).json({ vehicle });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function remove(req, res) {
  try {
    const id = parseInt(req.params.id);
    await deleteVehicle(id);
    return res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function purchase(req, res) {
  try {
    const id = parseInt(req.params.id);
    await purchaseVehicle(id);
    return res.status(200).json({ message: 'Vehicle purchased successfully' });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function restock(req, res) {
  const { quantity } = req.body;
  if (quantity === undefined || quantity === null) return res.status(400).json({ error: 'Quantity is required' });
  if (typeof quantity !== 'number' || quantity <= 0) return res.status(400).json({ error: 'Quantity must be a positive number' });
  try {
    const id = parseInt(req.params.id);
    await restockVehicle(id, quantity);
    return res.status(200).json({ message: 'Vehicle restocked successfully' });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { create, list, search, update, remove, purchase, restock };
