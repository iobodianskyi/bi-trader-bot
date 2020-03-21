(async () => {
  'use strict';

  const Telegraf = require('telegraf');
  const Telegram = require('telegraf/telegram');
  const Markup = require('telegraf/markup');

  const db = require('./db');
  const bitmex = require('./bitmex/api');
  const state = require('./state');
  const formatter = require('./formatter');

  let telegram;
  let bot;

  const getKeyboard = () => {
    return Markup
      .keyboard([[state.bot.buttons.prices, state.bot.buttons.alerts]])
      .resize()
      .extra();
  }

  const init = (token) => {
    telegram = new Telegram(token);
    bot = new Telegraf(token);

    bot.catch((error) => {
      console.log(state.bot.messages.error, error);
      sendAdminMessage(state.bot.messages.error);
    });

    bot.start(async (ctx) => {
      const user = ctx.from;
      const isNewUser = await db.addOrUpdateUser(user);

      const adminMessage = formatter.getAdminNewUserMessage(user);
      sendAdminMessage(adminMessage);

      const welcomeMessage = formatter.getWelcome(isNewUser, user);

      return ctx.reply(welcomeMessage, getKeyboard());
    });

    // commands
    bot.command(state.bot.commands.ping, ({ reply }) => reply(state.bot.messages.ping, getKeyboard()));

    // buttons
    bot.hears(state.bot.buttons.alerts, async (ctx) => {
      const userSettings = await db.getUserSettings(ctx.from.id);
      const prices = bitmex.getPrices();
      let message = '';
      for (const pair in prices) {
        const existPrice = userSettings.bitmex.displayPairPrices
          .find(userPair => userPair === pair);

        if (existPrice) { message += `${pair} - ${prices[pair]}\n`; }
      }

      return ctx.reply(message, getKeyboard());
    });

    // texts
    bot.hears('hey', ({ reply }) => {
      return reply('reply', getKeyboard());
    });

    bot.startPolling();

    sendAdminMessage(state.bot.messages.started);
  }

  const sendAdminMessage = (message) => {
    const adminMessage = formatter.getAdminMessage(message);
    telegram.sendMessage(state.app.telegram.myTelegramUserId, adminMessage);
  }

  module.exports = { init };
})();
