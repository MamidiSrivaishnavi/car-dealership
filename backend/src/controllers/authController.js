const { registerUser, loginUser } = require('../services/authService');
const { validateRegistration, validateLogin } = require('../validators/authValidator');

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

async function login(req, res) {
  const validationError = validateLogin(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const result = await loginUser(req.body);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { register, login };
