(async () => {
  'use strict';

  const admin = require('firebase-admin');
  const serviceAccount = require('./config/firestoreKeys.json');
  let firestore;

  const init = () => {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    firestore = admin.firestore();
  }

  const addOrUpdateUser = async (user) => {
    const docSnapshot = await firestore.doc(`users/${user.id}`).get();
    if (docSnapshot.exists) { // update user
      updateUser(user);
    } else { // add new user
      await addUser(user);
    }
  }

  const addUser = async (user) => {
    await firestore.doc(`users/${user.id}`).set(user);
  }

  const updateUser = async (user) => {
    await firestore.doc(`users/${user.id}`).set(user, { merge: true });
  }

  module.exports = { init, addOrUpdateUser };
})();
