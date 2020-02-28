(async () => {
  'use strict';

  const Telegraf = require('telegraf');
  const Telegram = require('telegraf/telegram');
  const Markup = require('telegraf/markup');

  let telegram;
  let bot;

  const buttons = {
    hi: 'hi'
  };

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
      welcome: 'Welcome!',
      started: 'Bot started 🚀',
      ping: 'pong',
      error: 'Ooops'
    };

    bot.catch((err) => {
      console.log(messages.error, err);
    })

    bot.start(({ reply }) => reply(messages.welcome, getKeyboard()));

    // commands
    bot.command(commands.ping, ({ reply }) => reply(messages.ping, getKeyboard()));

    bot.hears('hey', ({ reply }) => {
      return reply('reply', getKeyboard());
    });

    bot.startPolling();
  }

  module.exports = { init };
})();
