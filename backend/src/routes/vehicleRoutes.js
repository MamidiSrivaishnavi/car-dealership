const express = require('express');
const { create, list, search, update, remove, purchase, restock, myPurchases } = require('../controllers/vehicleController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.post('/', authenticate, authorize('ADMIN'), create);
router.get('/search', authenticate, search);
router.get('/my-purchases', authenticate, myPurchases);
router.get('/', authenticate, list);
router.put('/:id', authenticate, authorize('ADMIN'), update);
router.delete('/:id', authenticate, authorize('ADMIN'), remove);
router.post('/:id/purchase', authenticate, purchase);
router.post('/:id/restock', authenticate, authorize('ADMIN'), restock);

module.exports = router;
