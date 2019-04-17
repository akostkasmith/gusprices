
function usdToCad(usPrice, exchange) {  
  const litres = usPrice / 3.79;
  const price = litres / exchange;
  return price;
}

function cadToUsd(canPrice, exchange) {
  const gallons = caPrice * 3.79;
  const price = gallons * exchange;
  return price;
}

module.exports.USDtoCAD = usdToCad;
module.exports.CADtoUSD = cadToUsd;