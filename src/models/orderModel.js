const { db } = require('../db');

function markOrderFulfilled(orderId, fulfillmentId) {
  const updateOrder = db.prepare('UPDATE orders SET fulfillment_id = ?, status = ? WHERE id = ?');
  updateOrder.run(fulfillmentId, 'fulfilled', orderId);
}

function markOrderFulfillmentFailed(orderId) {
  const updateOrderStatus = db.prepare('UPDATE orders SET status = ? WHERE id = ?');
  updateOrderStatus.run('fulfillment_failed', orderId);
}

function getOrderForClient(orderId, clientId) {
  const getOrder = db.prepare('SELECT * FROM orders WHERE id = ? AND client_id = ?');
  return getOrder.get(orderId, clientId);
}

module.exports = {
  markOrderFulfilled,
  markOrderFulfillmentFailed,
  getOrderForClient,
};

