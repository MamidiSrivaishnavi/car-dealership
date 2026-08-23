const express = require('express');
const { create, list } = require('../controllers/vehicleController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.post('/', authenticate, authorize('ADMIN'), create);
router.get('/', authenticate, list);

module.exports = router;
