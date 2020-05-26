(async () => {
  'use strict';

  const Telegram = require('telegraf/telegram');

  const state = require('../state');
  const db = require('../db');
  const formatter = require('../formatter');
  const bitmex = require('../bitmex/api');

  let telegram;

  const init = (token) => {
    telegram = new Telegram(token);

    bitmex.subscribeToPriceAlerts(sendPriceAlertMessage);
  }

  const sendAdminMessage = (message) => {
    const adminMessage = formatter.getAdminMessage(message);
    telegram.sendMessage(state.app.telegram.common.myTelegramUserId, adminMessage);
  }

  const sendPriceAlertMessage = async (priceAlert) => {
    await db.deletePriceAlert(priceAlert.userId, priceAlert.symbol, priceAlert.price);
    telegram.sendMessage(priceAlert.userId, `${priceAlert.symbol}: ${priceAlert.price}`);
  }

  module.exports = { init, sendAdminMessage };
})();
