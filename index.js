const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Joi = require('joi');

var mongoDatabase = process.env.mongoDatabase;

mongoose.connect('mongodb://' + mongoDatabase + '/gusprices', {useNewUrlParser: true});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('connected!');
});

var gasPricesSchema = new mongoose.Schema({
  usdPrice: Number,
  cadPrice: Number,
  date: { type: Date, default: Date.now },
  exchange: Number
});

var gasPrice = mongoose.model('gasPrice', gasPricesSchema);




app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/getprice/:price/exchange/:exchange', (req, res) => {
  const usPrice = req.params.price;
  const exchange = req.params.exchange;
  
  const price = usdToCad(usPrice, exchange);
  const canPrice = {
    "price" : price,
    "exchange" : exchange,
  };

  res.json(canPrice);
});

app.post('/', (req, res) => {

  const schema = {
    usdPrice: Joi.required(),
    cadPrice: Joi.required(),
    exchange: Joi.required(),
    date: Joi.date()
  };  

  const result = Joi.validate(req.body, schema);

  if (result.error) return res.status(400).send(result.error.details[0].message);
 
  const newPrice = new gasPrice({
    usdPrice: req.body.usdPrice,
    cadPrice: req.body.cadPrice,
    exchange: req.body.exchange
  });

  console.log(newPrice);

  newPrice.save(function(err, price) {
    if (err) return console.error(err);
    console.log(price.usdPrice + " saved to prices");
  });
  const price = usdToCad(req.body.usdPrice, req.body.exchange);

  const canPrice = {
    "price" : price,
    "exchange" : req.body.exchange,
  };
  res.json(canPrice);
});

app.listen('8080');

function usdToCad(usPrice, exchange) {
  const litres = usPrice / 3.79;
  const price = litres / exchange;
  return price;
}