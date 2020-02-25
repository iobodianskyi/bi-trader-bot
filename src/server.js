(async function () {
  'use strict';

  const http = require('http');
  const express = require('express');
  const server = express();
  const bodyParser = require('body-parser');
  const cors = require('cors');

  server.use(bodyParser.json()); // support json encoded bodies
  server.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
  server.use(cors({ origin: ['', 'http://localhost:4200'] }));
  
  const startServer = () => {
    const httpServer = http.createServer(server);
    httpServer.listen(9004);
    console.log(`Server started on ${httpServer.address().port}`);
  }

  startServer();
}());
