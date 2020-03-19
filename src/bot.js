(async () => {
  'use strict';

  const Telegraf = require('telegraf');
  const Telegram = require('telegraf/telegram');
  const Markup = require('telegraf/markup');

  const db = require('./db');
  const bitmex = require('./bitmex/api');
  const resources = require('./resources');
  const formatter = require('./formatter');

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

    bot.catch((error) => {
      console.log(resources.bot.messages.error, error);
      sendAdminMessage(resources.bot.messages.error);
    });

    bot.start(async (ctx) => {
      const user = ctx.from;
      await db.addOrUpdateUser(user);

      const adminMessage = formatter.getAdminNewUserMessage(user);
      sendAdminMessage(adminMessage);

      return ctx.reply(`${resources.bot.messages.welcome}, ${user.first_name || user.last_name}!`, getKeyboard());
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
    const adminMessage = formatter.getAdminMessage(message);
    telegram.sendMessage(resources.app.telegram.myTelegramUserId, adminMessage);
  }

  module.exports = { init };
})();
