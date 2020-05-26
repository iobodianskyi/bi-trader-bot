(async () => {
  'use strict';

  const http = require('http');
  const express = require('express');
  const server = express();
  const request = require('request');
  const app = require('./app');
  const state = require('./state');

  const startServer = async () => {
    await app.start();

    server.use(state.bot.telegramBot.webhookCallback(state.app.telegram.bot.webhook.path));
    state.bot.telegramBot.telegram.setWebhook(state.app.telegram.bot.webhook.baseUrl + state.app.telegram.bot.webhook.path);

    const httpServer = http.createServer(server);
    httpServer.listen(state.app.port);
    console.log(`Bot started on ${httpServer.address().port}`);
  }

  // get app info
  request(state.project.infoUrl, { qs: { id: state.project.id }, json: true }, (error, responce, body) => {
    state.app.port = body.port;
    state.app.telegram = body.telegram;
    state.app.urls = body.urls;

    // start server
    startServer();
  });
})();
