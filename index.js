const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

app.get('/', (req, res) => {
  res.json([
    {
      tradeId: 1,
      buyer: 'Pekka',
      wasAGoodTrade: true,
    },
  ]);
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
