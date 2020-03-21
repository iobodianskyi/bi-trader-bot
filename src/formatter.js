(() => {
  'use strict';

  const state = require('./state');

  const getAdminMessage = (message) => {
    return `🎛 ${message}`;
  }

  const getAdminNewUserMessage = (user) => {
    let message = state.bot.messages.admin.newUser +
      `${user.username ? `\n@${user.username}` : ''}` +
      `\n${user.first_name || ''} ${user.last_name || ''}`;

    return message;
  }

  const getWelcome = (isNewUser, user) => {
    let message = `${isNewUser ? state.bot.messages.welcome : state.bot.messages.welcomeBack}` +
      ` ${user.first_name || user.last_name}!` +
      `\n\n${state.bot.messages.welcomeBotDescription.split('\\n').join('\n')}`;

    return message;
  }

  module.exports = { getAdminMessage, getAdminNewUserMessage, getWelcome };
})();
