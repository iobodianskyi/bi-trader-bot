(async () => {
  'use strict';

  const admin = require('firebase-admin');
  const serviceAccount = require('./config/firestoreKeys.json');
  const state = require('./state');

  let firestore;

  const collections = {
    settings: 'settings',
    users: 'users'
  }

  const docs = {
    resources: 'resources',
    priceAlerts: 'price-alerts'
  }

  const init = async () => {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    firestore = admin.firestore();
    await getSettings();
    await getPriceAlerts();
  }

  const getSettings = async () => {
    const settings = await (await firestore
      .collection(collections.settings)
      .doc(docs.resources)
      .get()).data();

    state.bot.messages = settings.messages;
    state.bot.commands = settings.commands;
    state.bot.buttons = settings.buttons;
  }

  const getPriceAlerts = async () => {
    const alerts = await (await firestore
      .collection(collections.settings)
      .doc(docs.priceAlerts)
      .get()).data().alerts;

    state.priceAlerts = alerts;
  }

  const addOrUpdateUser = async (user) => {
    const docSnapshot = await firestore
      .collection(collections.users)
      .doc(user.id + '').get();

    if (docSnapshot.exists) { // update user
      await updateUser(user);
    } else { // add new user
      await addUser(user);
    }

    return !docSnapshot.exists;
  }

  const addUser = async (user) => {
    user.settings = await getDefaultUserSettings();

    await firestore.collection(collections.users)
      .doc(user.id + '')
      .set(user);
  }

  const updateUser = async (user) => {
    await firestore
      .collection(collections.users)
      .doc(user.id + '')
      .set(user, { merge: true });
  }

  const getDefaultUserSettings = async () => {
    const settings = await (await firestore
      .collection(collections.settings)
      .doc(docs.resources)
      .get()).data();

    return settings.defaultUserSettings;
  }

  const getUserSettings = async (userId) => {
    const user = await (await firestore
      .collection(collections.users)
      .doc(userId + '')
      .get()).data();

    return user.settings;
  }

  module.exports = { init, addOrUpdateUser, getUserSettings };
})();
