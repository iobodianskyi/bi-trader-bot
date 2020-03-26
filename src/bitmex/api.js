(async () => {
  'use strict';

  const request = require('./request');

  const sockets = require('./sockets');
  const state = require('../state');

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

  const getWalletBalance = async (account) => {
    try {
      const result = await request.execute(
        {
          isTestnet: false,
          apiKeyId: account.id,
          apiKeySecret: account.secret
        },
        'GET',
        '/user/margin'
      );

      return result;
    } catch (error) {
      return { error: true, message: error.message };
    }
  }

  const trades = { getWalletBalance };

  module.exports = { init, getPrices, getPrice, subscribeToPriceAlerts, trades };
})();
