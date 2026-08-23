const { createVehicle } = require('../services/vehicleService');
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

module.exports = { create };
