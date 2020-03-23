(async () => {
  'use strict';

  const Telegraf = require('telegraf');

  const botApi = require('./api');
  const state = require('../state');
  const actions = require('./actions');

  let bot;

  const start = (token) => {
    botApi.init(token);

    bot = new Telegraf(token);

    bot.catch(actions.handleError);

    bot.start(actions.start);

    bot.help(actions.help);

    // prices button
    bot.hears(state.bot.buttons.prices, actions.prices);

    // price alerts button
    bot.hears(state.bot.buttons.alerts, actions.alerts);

    // settings button
    bot.hears(state.bot.buttons.settings, actions.settings);

    // add price alert
    bot.action(state.bot.actions.addPriceAlert, actions.addPriceAlert);

    // delete price alert
    bot.action(/🚫#(.*)\$(.*)&(.*)/i, actions.deletePriceAlert);

    // handle text inputs
    bot.on('text', actions.processTextInput);

    bot.startPolling();

    botApi.sendAdminMessage(state.bot.messages.started);
  }

  module.exports = { start };
})();
