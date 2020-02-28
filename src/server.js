(async function () {
  'use strict';

  const http = require('http');
  const express = require('express');
  const server = express();
  const bodyParser = require('body-parser');
  const cors = require('cors');
  const request = require('request');
  const app = require('./app');
  const resources = require('./resources');

  server.use(bodyParser.json()); // support json encoded bodies
  server.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
  server.use(cors({ origin: ['', 'http://localhost:4200'] }));

  const startServer = () => {
    const httpServer = http.createServer(server);
    httpServer.listen(resources.app.port);
    console.log(`Server started on ${httpServer.address().port}`);

    app.start();
  }

  // get app info
  request(resources.projectInfoUrl, { qs: { id: resources.projectId }, json: true }, (error, responce, body) => {
    resources.app.port = body.port;
    resources.app.telegram = body.telegram;

    // start server
    startServer();
  });
}());
