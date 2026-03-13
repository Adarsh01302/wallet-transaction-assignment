const { db, ensureClientAndWallet } = require('../db');

function getWallet(clientId) {
  ensureClientAndWallet(clientId);
  const stmt = db.prepare('SELECT balance_cents FROM wallets WHERE client_id = ?');
  return stmt.get(clientId);
}

function creditWallet(clientId, cents) {
  ensureClientAndWallet(clientId);

  const updateWallet = db.prepare('UPDATE wallets SET balance_cents = balance_cents + ?, updated_at = CURRENT_TIMESTAMP WHERE client_id = ?');
  const insertLedger = db.prepare('INSERT INTO wallet_ledger (client_id, change_cents, type) VALUES (?, ?, ?)');

  const tx = db.transaction(() => {
    updateWallet.run(cents, clientId);
    insertLedger.run(clientId, cents, 'admin_credit');
    const wallet = db.prepare('SELECT balance_cents FROM wallets WHERE client_id = ?').get(clientId);
    return wallet.balance_cents;
  });

  return tx();
}

function debitWalletAdmin(clientId, cents) {
  ensureClientAndWallet(clientId);

  const getWalletStmt = db.prepare('SELECT balance_cents FROM wallets WHERE client_id = ?');
  const updateWallet = db.prepare('UPDATE wallets SET balance_cents = balance_cents - ?, updated_at = CURRENT_TIMESTAMP WHERE client_id = ?');
  const insertLedger = db.prepare('INSERT INTO wallet_ledger (client_id, change_cents, type) VALUES (?, ?, ?)');

  const tx = db.transaction(() => {
    const wallet = getWalletStmt.get(clientId);
    if (!wallet || wallet.balance_cents < cents) {
      const err = new Error('Insufficient wallet balance');
      err.code = 'INSUFFICIENT_FUNDS';
      throw err;
    }
    updateWallet.run(cents, clientId);
    insertLedger.run(clientId, -cents, 'admin_debit');
    return wallet.balance_cents - cents;
  });

  return tx();
}

function debitWalletForOrder(clientId, cents) {
  ensureClientAndWallet(clientId);

  const getWalletStmt = db.prepare('SELECT balance_cents FROM wallets WHERE client_id = ?');
  const updateWallet = db.prepare('UPDATE wallets SET balance_cents = balance_cents - ?, updated_at = CURRENT_TIMESTAMP WHERE client_id = ?');
  const insertLedger = db.prepare('INSERT INTO wallet_ledger (client_id, change_cents, type, reference_id) VALUES (?, ?, ?, ?)');
  const insertOrder = db.prepare('INSERT INTO orders (client_id, amount_cents, status) VALUES (?, ?, ?)');

  let orderId;
  const tx = db.transaction(() => {
    const wallet = getWalletStmt.get(clientId);
    if (!wallet || wallet.balance_cents < cents) {
      const err = new Error('Insufficient wallet balance');
      err.code = 'INSUFFICIENT_FUNDS';
      throw err;
    }
    const orderResult = insertOrder.run(clientId, cents, 'created');
    orderId = orderResult.lastInsertRowid;
    updateWallet.run(cents, clientId);
    insertLedger.run(clientId, -cents, 'order_debit', String(orderId));
    return { orderId, balanceAfter: wallet.balance_cents - cents };
  });

  return tx();
}

module.exports = {
  getWallet,
  creditWallet,
  debitWalletAdmin,
  debitWalletForOrder,
};

