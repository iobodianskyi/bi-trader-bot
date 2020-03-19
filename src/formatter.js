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

  module.exports = { getAdminMessage, getAdminNewUserMessage };
})();
