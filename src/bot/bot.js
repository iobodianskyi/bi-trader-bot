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

    bot.start(actions.commands.start);

    bot.help(actions.commands.help);

    // wallet button
    bot.hears(state.bot.buttons.wallet, actions.trades.getWalletBalance);

    // positions button
    bot.hears(state.bot.buttons.positions, actions.trades.getPositions);

    // prices button
    bot.hears(state.bot.buttons.prices, actions.buttons.prices);

    // price alerts button
    bot.hears(state.bot.buttons.alerts, actions.buttons.alerts);

    // settings button
    bot.hears(state.bot.buttons.settings.settings, actions.buttons.settings);

    // add price alert
    bot.action(state.bot.actions.alerts.add, actions.actions.addPriceAlert);

    // delete price alert
    bot.action(/🚫#(.*)\$(.*)&(.*)/i, actions.actions.deletePriceAlert);

    // settings actions
    bot.action(/settings-(.*)/i, actions.actions.handleSettingsActions);

    // handle text inputs
    bot.on('text', actions.processTextInput);

    bot.startPolling();

    botApi.sendAdminMessage(state.bot.messages.started);
  }

  module.exports = { start };
})();
