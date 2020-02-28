(async () => {
  'use strict';

  const resources = require('./resources');
  const db = require('./db');
  const bot = require('./bot');


  const start = () => {
    // init db
    db.init();

    // start bot
    bot.init(resources.app.telegram.biTraderBotToken);

    // clrear token
    resources.app.telegram.biTraderBotToken = '';
  }

  module.exports = { start };
})();
