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
    let message = 'Wallet Balance: ' + parseInt(wallet.walletBalance * 1e-4) / 10000;
    message += '\nMargin Balance: ' + parseInt(wallet.marginBalance * 1e-4) / 10000;
    message += '\nAvailable Balance: ' + parseInt(wallet.excessMargin * 1e-4) / 10000;

    return message;
  }

  const getPositionsMessage = (positions) => {

    if (!positions.length) {
      return 'There is no opened positions';
    }

    let message = `Positions (${positions.length}):\n`;
    positions.forEach((position, index) => {
      if (index !== 0) { message += '- - -\n'; }

      message += position.symbol;
      message += '\nContracts: ' + position.currentQty;
      message += '\nEntry: ' + position.avgEntryPrice;
      message += '\nValue: ' + parseInt(position.homeNotional * 10000) / 10000;
      message += '\nLeverage: ' + (position.crossMargin ? 'Cross' : (position.leverage + 'x')) + '\n';
    });

    return message;
  }

  module.exports = {
    getAdminMessage,
    getAdminNewUserMessage,
    getMessage,
    getWelcome,
    getWalletBalanceMessage,
    getPositionsMessage
  };
})();
