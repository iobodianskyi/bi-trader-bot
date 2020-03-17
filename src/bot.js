(async () => {
  'use strict';

  const Telegraf = require('telegraf');
  const Telegram = require('telegraf/telegram');
  const Markup = require('telegraf/markup');

  const db = require('./db');
  const bitmex = require('./bitmex/api');
  const resources = require('./resources');

  let telegram;
  let bot;

  const getKeyboard = () => {
    return Markup
      .keyboard([[resources.bot.buttons.prices]])
      .resize()
      .extra();
  }

  const init = (token) => {
    telegram = new Telegram(token);
    bot = new Telegraf(token);

    bot.catch((err) => {
      console.log(resources.bot.messages.error, err);
      sendAdminMessage(resources.bot.messages.error);
    });

    bot.start(async (ctx) => {
      await db.addOrUpdateUser(ctx.from);
      return ctx.reply(`${resources.bot.messages.welcome}, ${ctx.from.first_name || ctx.from.last_name}!`, getKeyboard());
    });

    // commands
    bot.command(resources.bot.commands.ping, ({ reply }) => reply(resources.bot.messages.ping, getKeyboard()));

    // buttons
    bot.hears(resources.bot.buttons.prices, async ({ reply }) => {
      const prices = bitmex.getPrices();
      let message = '';
      for (const price in prices) {
        message += `${price} - ${prices[price]}\n`;
      }

      return reply(message, getKeyboard());
    });

    // texts
    bot.hears('hey', ({ reply }) => {
      return reply('reply', getKeyboard());
    });

    bot.startPolling();

    sendAdminMessage(resources.bot.messages.started);
  }

  const sendAdminMessage = (message) => {
    telegram.sendMessage(resources.app.telegram.myTelegramUserId, message);
  }

  module.exports = { init };
})();
