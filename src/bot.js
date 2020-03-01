(async () => {
  'use strict';

  const Telegraf = require('telegraf');
  const Telegram = require('telegraf/telegram');
  const Markup = require('telegraf/markup');

  const db = require('./db');
  const resources = require('./resources');

  let telegram;
  let bot;

  const buttons = {
    hi: 'hi'
  };

  // todo: for testing only
  const commands = {
    ping: 'ping'
  }

  const getKeyboard = () => {
    return Markup
      .keyboard([[buttons.hi]])
      .resize()
      .extra();
  }

  const init = (token) => {
    telegram = new Telegram(token);
    bot = new Telegraf(token);

    const messages = {
      welcome: 'Welcome',
      started: 'Bot started 🚀',
      ping: 'pong',
      error: 'Ooops'
    };

    bot.catch((err) => {
      console.log(messages.error, err);
      telegram.sendMessage(resources.app.telegram.myTelegramUserId, messages.error);
    });

    bot.start(async (ctx) => {
      await db.addOrUpdateUser(ctx.from);
      return ctx.reply(`${messages.welcome}, ${ctx.from.first_name || ctx.from.last_name}!`, getKeyboard());
    });

    // commands
    bot.command(commands.ping, ({ reply }) => reply(messages.ping, getKeyboard()));

    // texts
    bot.hears('hey', ({ reply }) => {
      return reply('reply', getKeyboard());
    });

    bot.startPolling();

    telegram.sendMessage(resources.app.telegram.myTelegramUserId, messages.started);
  }

  module.exports = { init };
})();
