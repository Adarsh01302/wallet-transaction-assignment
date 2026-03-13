function parseAmountToCents(amount) {
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    throw new Error('Amount must be a positive number');
  }
  return Math.round(amount * 100);
}

function centsToAmount(cents) {
  return cents / 100;
}

module.exports = {
  parseAmountToCents,
  centsToAmount,
};

