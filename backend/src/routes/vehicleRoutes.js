const express = require('express');
const { create, list, search, update, remove } = require('../controllers/vehicleController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.post('/', authenticate, authorize('ADMIN'), create);
router.get('/search', authenticate, search);
router.get('/', authenticate, list);
router.put('/:id', authenticate, authorize('ADMIN'), update);
router.delete('/:id', authenticate, authorize('ADMIN'), remove);

module.exports = router;
