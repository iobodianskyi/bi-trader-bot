(() => {
  'use strict';

  const resources = require('./resources');

  const getAdminMessage = (message) => {
    return `🎛 ${message}`;
  }

  const getAdminNewUserMessage = (user) => {
    let message = resources.bot.messages.admin.newUser +
      `${user.username ? `\n@${user.username}` : ''}` +
      `\n${user.first_name || ''} ${user.last_name || ''}`;

    return message;
  }

  const getWelcome = (isNewUser, user) => {
    let message = `${isNewUser ? resources.bot.messages.welcome : resources.bot.messages.welcomeBack}` +
      ` ${user.first_name || user.last_name}!` +
      `\n\n${resources.bot.messages.welcomeBotDescription.split('\\n').join('\n')}`;

    return message;
  }

  module.exports = { getAdminMessage, getAdminNewUserMessage, getWelcome };
})();
