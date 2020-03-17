(async () => {
  'use strict';

  const resources = require('./resources');
  const db = require('./db');
  const bitmex = require('./bitmex/api');
  const bot = require('./bot');

  const start = async () => {

    // init db
    await db.init();

    // init bitmex
    bitmex.init();

    // start bot
    bot.init(resources.app.telegram.biTraderBotToken);

    // clear token
    resources.app.telegram.biTraderBotToken = '';
  }

  module.exports = { start };
})();
