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
      `\n\n${getMessage(state.bot.messages.welcomeBotDescription)}`;

    return message;
  }

  const getMessage = (message) => {
    return message.split('\\n').join('\n');
  }

  const getWalletBalanceMessage = (wallet) => {
    let message = 'Wallet Balance: ' + (wallet.walletBalance * 1e-8).toFixed(4);
    message += '\nMargin Balance: ' + (wallet.marginBalance * 1e-8).toFixed(4)
    message += '\nAvailable Balance: ' + (wallet.excessMargin * 1e-8).toFixed(4);

    return message;
  }

  module.exports = { getAdminMessage, getAdminNewUserMessage, getMessage, getWelcome, getWalletBalanceMessage };
})();
