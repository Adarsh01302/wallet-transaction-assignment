const express = require('express');
const { createOrderController, getOrderDetailsController } = require('../controllers/orderController');

const router = express.Router();

router.post('/', createOrderController);
router.get('/:orderId', getOrderDetailsController);

module.exports = router;

