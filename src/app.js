const express = require('express');
const bodyParser = require('body-parser');

const adminRoutes = require('./routes/adminRoutes');
const orderRoutes = require('./routes/orderRoutes');
const walletRoutes = require('./routes/walletRoutes');

const app = express();

app.use(bodyParser.json());

app.use('/admin', adminRoutes);
app.use('/orders', orderRoutes);
app.use('/wallet', walletRoutes);

module.exports = app;

