const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data.sqlite');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS wallets (
    client_id TEXT PRIMARY KEY,
    balance_cents INTEGER NOT NULL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
  );

  CREATE TABLE IF NOT EXISTS wallet_ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id TEXT NOT NULL,
    change_cents INTEGER NOT NULL,
    type TEXT NOT NULL,
    reference_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'created',
    fulfillment_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
  );
`);

function ensureClientAndWallet(clientId) {
  const getClient = db.prepare('SELECT id FROM clients WHERE id = ?');
  const client = getClient.get(clientId);
  if (!client) {
    const insertClient = db.prepare('INSERT INTO clients (id) VALUES (?)');
    const insertWallet = db.prepare('INSERT INTO wallets (client_id, balance_cents) VALUES (?, 0)');
    const tx = db.transaction(() => {
      insertClient.run(clientId);
      insertWallet.run(clientId);
    });
    tx();
  }
}

module.exports = {
  db,
  ensureClientAndWallet,
};

