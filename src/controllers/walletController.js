const { centsToAmount } = require('../utils/amount');
const { getWallet } = require('../models/walletModel');

function getWalletBalanceController(req, res) {
  const clientId = req.header('client-id');
  if (!clientId) {
    return res.status(400).json({ error: 'client-id header is required' });
  }

  const wallet = getWallet(clientId);

  return res.status(200).json({
    client_id: clientId,
    balance: centsToAmount(wallet.balance_cents),
  });
}

module.exports = {
  getWalletBalanceController,
};

