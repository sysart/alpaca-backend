const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Alpaca = require('@alpacahq/alpaca-trade-api');
require('dotenv').config();

const app = express();

const alpaca = new Alpaca({
  keyId: process.env.ALPACA_KEY_ID,
  secretKey: process.env.ALPACA_KEY_SECRET,
  paper: true,
});

app.use(cors());
app.use(bodyParser.json());

app.post('/orders', async (req, res) => {
  const { symbol, qty } = req.body;
  await alpaca.createOrder({
    symbol,
    qty,
    side: 'buy',
    type: 'market',
    time_in_force: 'day',
  });
  res.send('ok');
});

app.get('/position/:symbol', (req, res) => {
  alpaca.getPosition(req.params.symbol).then((pos) => {
    res.json(pos);
  }).catch((err) => {
    res.status(400).json({
      status: 'error',
      message: 'could not get position',
    });
  });
});

app.post('/do-trade-if-it-is-reasonable/:symbol', async (req, res) => {
  const { symbol } = req.params;
  let pos;
  try {
    pos = await alpaca.getPosition(symbol);
  } catch (e) {
    res.status(400).json({
      status: 'error',
      message: 'could not get position',
    });
  }

  const percentage = Number(pos.unrealized_intraday_plpc);

  if (percentage < -0.1) {
    const orderQty = Number(pos.qty) * 2;
    await alpaca.createOrder({
      symbol,
      qty: orderQty,
      side: 'buy',
      type: 'market',
      time_in_force: 'day',
    });
    res.json({
      percentage,
      status: 'ordered',
      qty: orderQty,
    });
  } else if (percentage > 0.2) {
    await alpaca.closePosition(symbol);
    res.json({
      percentage,
      status: 'closed',
    });
  } else {
    res.json({
      percentage,
      status: 'nothing',
    });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
