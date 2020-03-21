(async () => {
  'use strict';

  const sockets = require('./sockets')
  const state = require('../state')

  const prices = {};
  let subscriberPriceAlerts;

  const getPrices = () => {
    return prices;
  }

  const getPrice = (symbol) => {
    return prices[symbol];
  }

  const init = () => {
    // init sockets
    const socket = sockets.init();

    socket.on(state.app.urls.bStreams.sockets.events.priceBitmex, (quote) => {
      processNewQoute(quote);
    });
  }

  const processNewQoute = (quote) => {
    prices[quote.symbol] = quote.bidPrice;

    checkPriceAlerts(quote);
  }

  const checkPriceAlerts = (quote) => {
    state.priceAlerts.forEach(priceAlert => {
      if (priceAlert.symbol === quote.symbol) {
        if (priceAlert.isLess) {
          if (quote.bidPrice <= priceAlert.price) {
            subscriberPriceAlerts(priceAlert);
          }
        } else {
          if (quote.bidPrice >= priceAlert.price) {
            subscriberPriceAlerts(priceAlert);
          }
        }
      }
    });
  }

  const subscribeToPriceAlerts = (callback) => {
    subscriberPriceAlerts = callback;
  }

  module.exports = { init, getPrices, getPrice, subscribeToPriceAlerts };
})();
