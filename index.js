const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Joi = require('joi');
const convert = require('./convert');
const request = require('request');

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
  
  const price = convert.USDtoCAD(usPrice, exchange);
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
    // exchange: Joi.required(),
    date: Joi.date()
  };  

  const result = Joi.validate(req.body, schema);

  if (result.error) return res.status(400).send(result.error.details[0].message);

  if (typeof req.body.exchange !== 'undefined') {
   // const exchange = getUpdatedRates();
  } else {
   // const exchange = req.body.exchange;
  }
  const exchange = getUpdatedRates();

  const newPrice = new gasPrice({
    usdPrice: req.body.usdPrice,
    cadPrice: req.body.cadPrice,
    exchange: exchange
  });

  //console.log(newPrice);

  newPrice.save(function(err, price) {
    if (err) return console.error(err);
    console.log(price.usdPrice + " saved to prices");
  });
  const price = convert.USDtoCAD(req.body.usdPrice, exchange);

  const canPrice = {
    "price" : price,
    "exchange" : exchange,
  };
  res.json(canPrice);
});

app.listen('8080');

function getUpdatedRates() {
  request('https://api.exchangeratesapi.io/latest?base=CAD&symbols=USD', (err, res, body) => {
    if (!err && res.statusCode == 200) {
      const rate = JSON.parse(body);
      return rate.rates.USD;
    } else {
      return false;
    }
  });
}
