(() => {
  const state = {
    // will be filled from db
    project: {
      id: 'bi-trader-bot',
      infoUrl: 'https://us-central1-dev-obodianskyi.cloudfunctions.net/projectInfo'
    },
    app: {
      port: 0,
      telegram: {},
      urls: {}
    },
    bot: {
      telegramBot: null,
      messages: {},
      buttons: {},
      commands: {},
      actions: {}
    },
    priceAlerts: []
  };

  module.exports = state;
})();
