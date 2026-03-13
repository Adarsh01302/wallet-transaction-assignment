const express = require('express');
const { creditWalletController, debitWalletController } = require('../controllers/adminController');

const router = express.Router();

router.post('/wallet/credit', creditWalletController);
router.post('/wallet/debit', debitWalletController);

module.exports = router;

