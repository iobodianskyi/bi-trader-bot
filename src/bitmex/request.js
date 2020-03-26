(async () => {
  'use strict';

  const fetch = require('node-fetch');
  const crypto = require('crypto');
  const qs = require('qs');

  const execute = (auth, verb, endpoint, data = {}) => {
    const apiRoot = '/api/v1/';

    const expires = Math.round(new Date().getTime() / 1000) + 60; // 1 min in the future

    let query = '', postBody = '';
    if (verb === 'GET')
      query = '?' + qs.stringify(data);
    else
      // Pre-compute the reqBody so we can be sure that we're using *exactly* the same body in the request
      // and in the signature. If you don't do this, you might get differently-sorted keys and blow the signature.
      postBody = JSON.stringify(data);

    const signature = crypto.createHmac('sha256', auth.apiKeySecret)
      .update(verb + apiRoot + endpoint + query + expires + postBody).digest('hex');

    const headers = {
      'content-type': 'application/json',
      'accept': 'application/json',
      // This example uses the 'expires' scheme. You can also use the 'nonce' scheme. See
      // https://www.bitmex.com/app/apiKeysUsage for more details.
      'api-expires': expires,
      'api-key': auth.apiKeyId,
      'api-signature': signature,
    };

    const requestOptions = {
      method: verb,
      headers,
    };

    if (verb !== 'GET') requestOptions.body = postBody;  // GET/HEAD requests can't have body

    const baseUrl = auth.isTestnet ? 'https://testnet.bitmex.com' : 'https://www.bitmex.com';
    const url = baseUrl + apiRoot + endpoint + query;

    return fetch(url, requestOptions).then(response => response.json()).then(
      response => {
        if ('error' in response) throw new Error(response.error.message);
        return response;
      },
      error => console.error('Network error', error),
    );
  }

  module.exports = { execute };
})();
