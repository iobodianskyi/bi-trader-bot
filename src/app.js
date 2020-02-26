(async () => {
  'use strict';

  const db = require('./db');

  const start = () => {
    // init db
    db.init();
    // start bot
  }

  module.exports = { start };
})();
