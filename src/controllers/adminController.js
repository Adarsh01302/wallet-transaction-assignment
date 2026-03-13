const { parseAmountToCents, centsToAmount } = require('../utils/amount');
const { creditWallet, debitWalletAdmin } = require('../models/walletModel');

async function creditWalletController(req, res) {
  const { client_id: clientId, amount } = req.body || {};
  if (!clientId) {
    return res.status(400).json({ error: 'client_id is required' });
  }

  let cents;
  try {
    cents = parseAmountToCents(amount);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  try {
    const newBalanceCents = creditWallet(clientId, cents);
    return res.status(200).json({
      client_id: clientId,
      balance: centsToAmount(newBalanceCents),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to credit wallet' });
  }
}

async function debitWalletController(req, res) {
  const { client_id: clientId, amount } = req.body || {};
  if (!clientId) {
    return res.status(400).json({ error: 'client_id is required' });
  }

  let cents;
  try {
    cents = parseAmountToCents(amount);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  try {
    const newBalanceCents = debitWalletAdmin(clientId, cents);
    return res.status(200).json({
      client_id: clientId,
      balance: centsToAmount(newBalanceCents),
    });
  } catch (err) {
    if (err.code === 'INSUFFICIENT_FUNDS') {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Failed to debit wallet' });
  }
}

module.exports = {
  creditWalletController,
  debitWalletController,
};

