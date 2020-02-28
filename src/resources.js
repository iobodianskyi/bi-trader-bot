(() => {
  const resources = {
    // will be filled from db
    app: {
      port: 0,
      telegram: {},
    },
    projectId: 'bi-trader-bot',
    projectInfoUrl: 'https://us-central1-dev-obodianskyi.cloudfunctions.net/projectInfo'
  };

  module.exports = resources;
})();
