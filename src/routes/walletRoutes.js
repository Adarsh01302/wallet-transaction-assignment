const express = require('express');
const { getWalletBalanceController } = require('../controllers/walletController');

const router = express.Router();

router.get('/balance', getWalletBalanceController);

module.exports = router;

