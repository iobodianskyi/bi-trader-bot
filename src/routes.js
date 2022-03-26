(async () => {
  const server = require('express')();

  server.get('/ping', async (req, res) => {
    return res.send('pong');
  });

  server.get('/update-info', async (req, res) => {
    return res.send('not implemented');
  });

  module.exports = server;
})();
