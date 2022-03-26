(async () => {
  'use strict';

  const http = require('http');
  const express = require('express');
  const server = express();
  const request = require('request');
  const app = require('./app');
  const state = require('./state');
  const auth = require('./config/auth');

  const startServer = async () => {
    // enable routes
    const apiRoutes = require('./routes');
    server.use(apiRoutes);

    await app.start();

    server.use(
      state.bot.telegramBot.webhookCallback(state.app.telegram.bot.webhook.path)
    );
    state.bot.telegramBot.telegram.setWebhook(
      state.app.telegram.bot.webhook.baseUrl +
        state.app.telegram.bot.webhook.path
    );

    const httpServer = http.createServer(server);
    httpServer.listen(state.app.port);
    console.log(
      `Server started on http://localhost:${httpServer.address().port}`
    );
  };

  // get app info
  const token = auth.getAuthToken();
  request(
    state.project.infoUrl,
    {
      qs: { id: state.project.id },
      auth: {
        bearer: token
      },
      json: true
    },
    (error, responce, body) => {
      if (body.port) {
        state.app.port = body.port;
        state.app.telegram = body.telegram;
        state.app.urls = body.urls;

        // start server
        startServer();
      }
    }
  );
})();
