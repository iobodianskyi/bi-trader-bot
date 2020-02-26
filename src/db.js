(async () => {
  'use strict';

  const admin = require('firebase-admin');
  const serviceAccount = require('./config/firestoreKeys.json');

  const init = () => {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    this.firestore = admin.firestore();
  }

  module.exports = { init };
})();
