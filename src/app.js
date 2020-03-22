(async () => {
  'use strict';

  const state = require('./state');
  const db = require('./db');
  const bitmex = require('./bitmex/api');
  const bot = require('./bot/bot');

  const start = async () => {

    // init db
    await db.init();

    // init bitmex
    bitmex.init();

    // start bot
    bot.start(state.app.telegram.biTraderBotToken);

    // clear token
    state.app.telegram.biTraderBotToken = '';
  }

  module.exports = { start };
})();
