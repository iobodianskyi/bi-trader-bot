(async () => {
  'use strict';

  const sockets = require('./sockets')
  const resources = require('../resources')

  const prices = {};

  const getPrices = () => {
    return prices;
  }

  const getPrice = (symbol) => {
    return prices[symbol];
  }

  const init = () => {
    // init sockets
    const socket = sockets.init();

    socket.on(resources.app.urls.bStreams.sockets.events.priceBitmex, (quote) => {
      processNewQoute(quote);
    });
  }

  const processNewQoute = (quote) => {
    prices[quote.symbol] = quote.bidPrice;
  }

  module.exports = { init, getPrices, getPrice };
})();
