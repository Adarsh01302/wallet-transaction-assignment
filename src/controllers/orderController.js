const fetch = require('node-fetch');
const { parseAmountToCents, centsToAmount } = require('../utils/amount');
const { debitWalletForOrder } = require('../models/walletModel');
const { markOrderFulfilled, markOrderFulfillmentFailed, getOrderForClient } = require('../models/orderModel');

async function createOrderController(req, res) {
  const clientId = req.header('client-id');
  const { amount } = req.body || {};

  if (!clientId) {
    return res.status(400).json({ error: 'client-id header is required' });
  }

  let cents;
  try {
    cents = parseAmountToCents(amount);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  let result;
  try {
    result = debitWalletForOrder(clientId, cents);
  } catch (err) {
    if (err.code === 'INSUFFICIENT_FUNDS') {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Failed to create order' });
  }

  const { orderId } = result;

  try {
    const fulfillmentResponse = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: clientId,
        title: String(orderId),
      }),
    });

    if (!fulfillmentResponse.ok) {
      throw new Error('Fulfillment API failed');
    }

    const data = await fulfillmentResponse.json();
    const fulfillmentId = String(data.id);
    markOrderFulfilled(orderId, fulfillmentId);

    return res.status(201).json({
      order_id: orderId,
      client_id: clientId,
      amount: centsToAmount(cents),
      status: 'fulfilled',
      fulfillment_id: fulfillmentId,
    });
  } catch (err) {
    markOrderFulfillmentFailed(orderId);
    return res.status(502).json({
      error: 'Order created but fulfillment failed',
      order_id: orderId,
    });
  }
}

function getOrderDetailsController(req, res) {
  const clientId = req.header('client-id');
  const { orderId } = req.params;

  if (!clientId) {
    return res.status(400).json({ error: 'client-id header is required' });
  }

  const order = getOrderForClient(orderId, clientId);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  return res.status(200).json({
    order_id: order.id,
    client_id: order.client_id,
    amount: centsToAmount(order.amount_cents),
    status: order.status,
    fulfillment_id: order.fulfillment_id,
    created_at: order.created_at,
  });
}

module.exports = {
  createOrderController,
  getOrderDetailsController,
};

