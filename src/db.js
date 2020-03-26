(async () => {
  'use strict';

  const admin = require('firebase-admin');
  const serviceAccount = require('./config/firestoreKeys.json');

  const state = require('./state');
  const bitmex = require('./bitmex/api');

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
    state.bot.actions = settings.actions;
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
      user.settings = docSnapshot.data().settings;
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

  const setUserLastAction = async (userId, actionId, actionData) => {
    const docRef = firestore
      .collection(collections.users)
      .doc(userId + '');

    await admin.firestore()
      .runTransaction(async transaction => {
        return transaction.get(docRef).then(snapshot => {
          const settings = snapshot.get('settings');
          settings.lastAction.id = actionId;
          settings.lastAction.data = actionData || null;

          transaction.set(docRef, { settings }, { merge: true })
        });
      });
  }

  const getUserPriceAlerts = (userId) => {
    return state.priceAlerts.filter(priceAlert => priceAlert.userId === userId);
  }

  const addPriceAlert = async (userId, symbol, price) => {
    const existing = state.priceAlerts
      .find(priceAlert => priceAlert.userId === userId &&
        priceAlert.symbol === symbol &&
        priceAlert.price === price);

    if (existing) { return; }

    const currentPrice = bitmex.getPrices()[symbol];
    const isLess = currentPrice > price;

    const newPriceAlert = { userId, symbol, price, isLess }

    const docRef = firestore
      .collection(collections.settings)
      .doc(docs.priceAlerts);

    await admin.firestore()
      .runTransaction(async transaction => {
        return transaction.get(docRef).then(snapshot => {
          const alerts = snapshot.get('alerts');

          alerts.push(newPriceAlert);

          transaction.update(docRef, { alerts });
        });
      });

    state.priceAlerts.push(newPriceAlert);
  }

  const deletePriceAlert = async (userId, symbol, price) => {
    const docRef = firestore
      .collection(collections.settings)
      .doc(docs.priceAlerts);

    await admin.firestore()
      .runTransaction(async transaction => {
        return transaction.get(docRef).then(snapshot => {
          const alerts = snapshot.get('alerts')
            .filter(alert => !(alert.userId === userId &&
              alert.symbol === symbol &&
              alert.price === price));

          state.priceAlerts = alerts;

          transaction.update(docRef, { alerts });
        });
      });
  }

  module.exports = {
    init,
    addOrUpdateUser,
    updateUser,
    getUserSettings,
    getUserPriceAlerts,
    setUserLastAction,
    addPriceAlert,
    deletePriceAlert
  };
})();
