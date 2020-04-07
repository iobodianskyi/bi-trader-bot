
(async () => {
  'use strict';

  const fetch = require('node-fetch');
  const state = require('../state');

  const sendInfoBotMessage = async (message, options) => {
    try {
      const headers = {
        'content-type': 'application/json',
        'accept': 'application/json'
      };

      options = options || {};

      const requestOptions = {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: message, options: options })
      };

      return fetch(state.app.urls.sendMessage, requestOptions)
        .then(
          response => { return response; },
          error => { console.log(error) }
        );
    } catch (error) {
      console.log(error);
    }
  }

  module.exports = { sendInfoBotMessage };
})();
