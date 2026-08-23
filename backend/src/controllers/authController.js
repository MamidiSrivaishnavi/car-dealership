const { registerUser } = require('../services/authService');
const { validateRegistration } = require('../validators/authValidator');

async function register(req, res) {
  const validationError = validateRegistration(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const user = await registerUser(req.body);
    return res.status(201).json({ user });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { register };
