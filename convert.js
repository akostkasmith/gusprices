const request = require('request');

function getUpdatedRates() {
  request('https://api.exchangeratesapi.io/latest?base=CAD&symbols=USD', (err, res, body) => {
    if (!err && res.statusCode == 200) {
      const rate = JSON.parse(body);
      return rate.rates.USD;
    } else {
      return 0;
    }
  });
}

function usdToCad(usPrice, exchange) {
  
  const litres = usPrice / 3.79;
  if (!exchange) {
    exchange = getUpdatedRates();
  } 
  const price = litres / exchange;
  return price;
}

function cadToUsd(canPrice, exchange) {
  const gallons = caPrice * 3.79;
  if (!exchange) {
    exchange = getUpdatedRates();
  }
  const price = gallons * exchange;
  return price;
}

module.exports.USDtoCAD = usdToCad;
module.exports.CADtoUSD = cadToUsd;