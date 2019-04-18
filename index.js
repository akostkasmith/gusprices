const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Joi = require('joi');
const convert = require('./convert');
const request = require('request-promise');

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

app.get('/', (req, res) => {
  
  request('https://api.exchangeratesapi.io/latest?base=CAD&symbols=USD')
  .then((result)=>{  
    
    const resultJSON = JSON.parse(result);  
    exchange = resultJSON.rates.USD;
    return Promise.resolve(exchange);

  })
  .then((result) => {  
   
    const usPrice = req.query.price;

    if (req.query.exchange !== '') {
      var currentExchange = req.query.exchange;
    } else {
      var currentExchange = result;
    }

    const price = convert.USDtoCAD(usPrice, currentExchange);
    const canPrice = {
      "price" : price,
      "exchange" : currentExchange,
    };
    res.status(200).json(canPrice);

  }).catch((error) => {

    res.status(400).send('Nope');

  });

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
 
  let exchange = req.body.exchange;

  const newPrice = new gasPrice({
    usdPrice: req.body.usdPrice,
    cadPrice: req.body.cadPrice,
    exchange: req.body.exchange
  });


  newPrice.save(function(err, price) {
    if (err) return console.error(err);
    console.log(price.usdPrice + " saved to prices");
  });
  const price = convert.USDtoCAD(req.body.usdPrice, req.body.exchange);

  const canPrice = {
    "price" : price,
    "exchange" : req.body.exchange,
  };
  res.json(canPrice);
});

app.listen('8080');

