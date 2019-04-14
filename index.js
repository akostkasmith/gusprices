const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/getprice/:price/exchange/:exchange', (req, res) => {
  const usPrice = req.params.price;
  const exchange = req.params.exchange;
  const litres = usPrice / 3.79;
  const canPrice = {
    "price" : litres / exchange,
    "exchange" : exchange,
  };

  res.json(canPrice);
});
app.listen('8080');