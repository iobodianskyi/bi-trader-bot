(async () => {
  'use strict';

  const Telegraf = require('telegraf');
  const Telegram = require('telegraf/telegram');
  const Markup = require('telegraf/markup');

  const db = require('./db');
  const resources = require('./resources');

  let telegram;
  let bot;

  const getKeyboard = () => {
    return Markup
      .keyboard([[resources.bot.buttons.hi]])
      .resize()
      .extra();
  }

  const init = (token) => {
    telegram = new Telegram(token);
    bot = new Telegraf(token);

    bot.catch((err) => {
      console.log(resources.bot.messages.error, err);
      telegram.sendMessage(resources.app.telegram.myTelegramUserId, resources.bot.messages.error);
    });

    bot.start(async (ctx) => {
      await db.addOrUpdateUser(ctx.from);
      return ctx.reply(`${resources.bot.messages.welcome}, ${ctx.from.first_name || ctx.from.last_name}!`, getKeyboard());
    });

    // commands
    bot.command(resources.bot.commands.ping, ({ reply }) => reply(resources.bot.messages.ping, getKeyboard()));

    // texts
    bot.hears('hey', ({ reply }) => {
      return reply('reply', getKeyboard());
    });

    bot.startPolling();

    telegram.sendMessage(resources.app.telegram.myTelegramUserId, resources.bot.messages.started);
  }

  module.exports = { init };
})();
