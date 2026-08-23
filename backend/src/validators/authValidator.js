function validateRegistration({ email, password }) {
  if (!email) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email format is invalid';
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
}

function validateLogin({ email, password }) {
  if (!email) return 'Email is required';
  if (!password) return 'Password is required';
  return null;
}

module.exports = { validateRegistration, validateLogin };
