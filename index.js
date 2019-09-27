const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

app.get('/get-stocks', (req, res) => {
  res.json([]);
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
