(async () => {
  'use strict';

  const http = require('http');
  const express = require('express');
  const server = express();
  const bodyParser = require('body-parser');
  const cors = require('cors');
  const request = require('request');
  const app = require('./app');
  const state = require('./state');

  server.use(bodyParser.json()); // support json encoded bodies
  server.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
  server.use(cors({ origin: ['', 'http://localhost:4200'] }));

  const startServer = async () => {
    const httpServer = http.createServer(server);
    httpServer.listen(state.app.port);
    console.log(`Server started on ${httpServer.address().port}`);

    await app.start();
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
