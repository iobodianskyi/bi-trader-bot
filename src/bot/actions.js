(async () => {
  'use strict';

  const Markup = require('telegraf/markup');
  const Extra = require('telegraf/extra');

  const state = require('../state');
  const db = require('../db');
  const botApi = require('./api');
  const bitmex = require('../bitmex/api');
  const formatter = require('../formatter');

  const getKeyboard = (userSettings) => {
    if (userSettings && userSettings.bitmex.api.id && userSettings.bitmex.api.secret) {
      return Markup
        .keyboard([
          [state.bot.buttons.prices, state.bot.buttons.alerts],
          [state.bot.buttons.wallet],
          [state.bot.buttons.settings.settings]])
        .resize()
        .extra();
    }

    return Markup
      .keyboard([
        [state.bot.buttons.prices, state.bot.buttons.alerts],
        [state.bot.buttons.settings.settings]])
      .resize()
      .extra();
  }

  const getSettingsInlineKeyboard = () => {
    return Extra.markup(Markup.inlineKeyboard([
      Markup.callbackButton(state.bot.buttons.settings.pricePairs, state.bot.actions.settings.pricePairs),
      Markup.callbackButton(state.bot.buttons.settings.apiKeys, state.bot.actions.settings.apiKeys)
    ]));
  };

  const start = async (ctx) => {
    const user = ctx.from;
    const isNewUser = await db.addOrUpdateUser(user);
    if (!isNewUser) {
      await db.setUserLastAction(user.id, state.bot.actions.start);
    }

    const adminMessage = formatter.getAdminNewUserMessage(user);
    botApi.sendAdminMessage(adminMessage);

    const welcomeMessage = formatter.getWelcome(isNewUser, user);

    ctx.reply(welcomeMessage, getKeyboard(user.settings));
  }

  const help = async (ctx) => {
    const userSettings = await db.getUserSettings(ctx.from.id);
    const helpMessage = formatter.getMessage(state.bot.messages.help);
    return ctx.reply(helpMessage, getKeyboard(userSettings));
  }

  const handleError = async (error) => {
    console.log(state.bot.messages.error, error);
    botApi.sendAdminMessage(state.bot.messages.error);
  }

  const prices = async (ctx) => {
    const userSettings = await db.getUserSettings(ctx.from.id);
    const prices = bitmex.getPrices();
    let message = '';
    for (const pair in prices) {
      const existPrice = userSettings.bitmex.displayPairPrices
        .find(userPair => userPair === pair);

      if (existPrice) { message += `${pair} - ${prices[pair]}\n`; }
    }

    await db.setUserLastAction(ctx.from.id, state.bot.actions.prices);

    ctx.deleteMessage();

    return ctx.reply(message, getKeyboard(userSettings));
  }

  const alerts = async (ctx) => {
    await sendAlertsMessage(ctx);
    await db.setUserLastAction(ctx.from.id, state.bot.actions.alerts);
  }

  const settings = async (ctx) => {
    ctx.deleteMessage();

    return ctx.reply(state.bot.messages.settings.settings, getSettingsInlineKeyboard());
  }

  const addPriceAlert = async (ctx) => {
    await db.setUserLastAction(ctx.from.id, state.bot.actions.addPriceAlert);

    ctx.deleteMessage();

    return ctx.reply(state.bot.messages.enterPriceForAlert);
  }

  const deletePriceAlert = async (ctx) => {
    const userId = +ctx.update.callback_query.data.match(/#(.*)\$/i)[1];
    const symbol = ctx.update.callback_query.data.match(/\$(.*)\&/i)[1];
    const price = parseFloat(ctx.update.callback_query.data.match(/\&(.*)/i)[1]);

    await db.deletePriceAlert(userId, symbol, price);

    await sendAlertsMessage(ctx);

    await db.setUserLastAction(ctx.from.id, state.bot.actions.deletePriceAlert);
  }

  const processTextInput = async (ctx) => {
    const userSettings = await db.getUserSettings(ctx.from.id);

    if (ctx.update.message &&
      ctx.update.message.reply_to_message) {

      switch (ctx.update.message.reply_to_message.text) {
        case state.bot.messages.settings.enterApiId: {

          const user = ctx.from;
          user.settings = userSettings;

          user.settings.bitmex.api.id = ctx.update.message.text;

          await db.updateUser(user);

          ctx.deleteMessage(ctx.update.message.reply_to_message.message_id);
          ctx.deleteMessage();

          if (user.settings.bitmex.api.secret) {
            return ctx.reply(state.bot.messages.settings.apiKeysReady, getKeyboard(userSettings));
          }

          const forceReply = Extra.markdown().markup(Markup.forceReply());
          return ctx.reply(state.bot.messages.settings.enterApiSecret, forceReply);
        }
        case state.bot.messages.settings.enterApiSecret: {
          const user = ctx.from;
          user.settings = userSettings;

          user.settings.bitmex.api.secret = ctx.update.message.text;

          await db.updateUser(user);

          ctx.deleteMessage(ctx.update.message.reply_to_message.message_id);
          ctx.deleteMessage();

          if (user.settings.bitmex.api.id) {
            return ctx.reply(state.bot.messages.settings.apiKeysReady, getKeyboard(userSettings));
          }

          const forceReply = Extra.markdown().markup(Markup.forceReply());
          return ctx.reply(state.bot.messages.settings.enterApiId, forceReply);
        }
        default:
          return ctx.reply(state.bot.messages.cannotGetYou, getKeyboard(userSettings));
      }
    };

    switch (userSettings.lastAction.id) {
      case state.bot.actions.addPriceAlert:
      case state.bot.actions.addedPriceAlert: {
        // add new price alert

        let price = parseFloat(ctx.update.message.text.replace(',', '.'));

        if (isNaN(price)) {
          return ctx.reply(state.bot.messages.incorrectPriceForAlert, getKeyboard());
        }

        // by default pair is XBTUSD
        const symbol = 'XBTUSD';
        await db.addPriceAlert(ctx.from.id, symbol, price);
        await db.setUserLastAction(ctx.from.id, state.bot.actions.addedPriceAlert);
        await sendAlertsMessage(ctx);

        break;
      }
      case state.bot.actions.unknownText: {
        return ctx.reply(state.bot.messages.cannotGetYou, getKeyboard(userSettings));
      }
      default: {
        await db.setUserLastAction(ctx.from.id, state.bot.actions.unknownText);
        return ctx.reply(state.bot.messages.cannotGetYou, getKeyboard(userSettings));
      }
    }
  }

  const sendAlertsMessage = async (ctx) => {
    const userAlerts = db.getUserPriceAlerts(ctx.from.id);
    const addButton = Markup.callbackButton(state.bot.buttons.addPriceAlert, state.bot.actions.addPriceAlert);

    if (userAlerts.length) {
      const buttons = [];

      let outerIndex = -1;

      userAlerts
        .sort((a, b) => a.price - b.price)
        .forEach((alert, innerIndex) => {
          const newButton = Markup.callbackButton(`${alert.price} ✖️`, `🚫#${alert.userId}$${alert.symbol}&${alert.price}`);
          if (innerIndex % 4 === 0) { outerIndex++; }
          buttons[outerIndex] ? buttons[outerIndex].push(newButton) : buttons.push([newButton]);
        });

      buttons.push([addButton]);

      const alertsKeyboard = Markup.inlineKeyboard(buttons);

      ctx.deleteMessage();

      return ctx.replyWithMarkdown(state.bot.messages.alertList, Extra.markup(alertsKeyboard));
    } else {
      const alertsKeyboard = Markup.inlineKeyboard([addButton]);

      ctx.deleteMessage();

      return ctx.replyWithMarkdown(state.bot.messages.noAlerts, Extra.markup(alertsKeyboard));
    }
  }

  const handleSettingsActions = async (ctx) => {
    ctx.answerCbQuery();

    const userSettings = await db.getUserSettings(ctx.from.id);

    let action = ctx.update.callback_query.data;

    if (ctx.update.callback_query.data.includes('settings-price-pair-a-')) {
      action = state.bot.actions.settings.addPricePair;
    }

    if (ctx.update.callback_query.data.includes('settings-price-pair-d-')) {
      action = state.bot.actions.settings.deletePricePair;
    }

    switch (action) {
      case state.bot.actions.settings.pricePairs: {
        return handleSettingsDisplayPricePairs(ctx, userSettings);
      }
      case state.bot.actions.settings.apiKeys: {
        const urlBitmexApiKeysButton = Markup.urlButton(
          state.bot.buttons.bitmexApiKeysButton,
          state.bot.buttons.bitmexApiKeysButtonUrl);
        const enterIdButton = Markup.callbackButton(
          state.bot.buttons.settings.enterApiId,
          state.bot.actions.settings.enterApiId);
        const enterSecretButton = Markup.callbackButton(
          state.bot.buttons.settings.enterApiSecret,
          state.bot.actions.settings.enterApiSecret);

        let message = '';
        if (!userSettings.bitmex.api.id && !userSettings.bitmex.api.secret) {
          message = state.bot.messages.settings.apiMissed;
        } else if (!userSettings.bitmex.api.id) {
          message = state.bot.messages.settings.apiIdMissed;
        } else if (!userSettings.bitmex.api.secret) {
          message = state.bot.messages.settings.apiSecretMissed;
        } else {
          message = state.bot.messages.settings.apiFilled;
        }

        return ctx.editMessageText(
          formatter.getMessage(message),
          Extra.markup(Markup.inlineKeyboard(
            [
              [urlBitmexApiKeysButton],
              [enterIdButton, enterSecretButton],
              [
                Markup.callbackButton(state.bot.buttons.settings.back,
                  state.bot.actions.settings.back)
              ]
            ]))
        );
      }
      case state.bot.actions.settings.enterApiId: {
        const extra = Extra.markdown().markup(Markup.forceReply());
        return ctx.reply(state.bot.messages.settings.enterApiId, extra);
      }
      case state.bot.actions.settings.enterApiSecret: {
        const extra = Extra.markdown().markup(Markup.forceReply());
        return ctx.reply(state.bot.messages.settings.enterApiSecret, extra);
      }
      case state.bot.actions.settings.addPricePair: {
        const symbol = ctx.update.callback_query.data.slice(ctx.update.callback_query.data.lastIndexOf('-') + 1);
        userSettings.bitmex.displayPairPrices.push(symbol);
        const user = ctx.from;
        user.settings = userSettings;

        await db.updateUser(user);

        return handleSettingsDisplayPricePairs(ctx, userSettings);
      }
      case state.bot.actions.settings.deletePricePair: {
        const symbol = ctx.update.callback_query.data.slice(ctx.update.callback_query.data.lastIndexOf('-') + 1);

        const index = userSettings.bitmex.displayPairPrices.indexOf(symbol);
        if (index > -1) {
          userSettings.bitmex.displayPairPrices.splice(index, 1);
        }

        const user = ctx.from;
        user.settings = userSettings;

        await db.updateUser(user);

        return handleSettingsDisplayPricePairs(ctx, userSettings);
      }
      case state.bot.actions.settings.back: {
        return ctx.editMessageText(
          state.bot.messages.settings.settings,
          getSettingsInlineKeyboard());
      }
      default: {
        break;
      }
    }
  }

  const handleSettingsDisplayPricePairs = async (ctx, userSettings) => {
    const buttons = [];

    const pairPrices = [];

    const prices = bitmex.getPrices();
    for (const pair in prices) {
      pairPrices.push({ symbol: pair, price: prices[pair] });
    }

    let outerIndex = -1;

    pairPrices.forEach((price, innerIndex) => {
      const existPrice = userSettings.bitmex.displayPairPrices
        .find(userPair => userPair === price.symbol);

      let text = `${existPrice ? `x` : `+`} ${price.symbol}`;
      let action = `settings-price-pair-${existPrice ? 'd' : 'a'}-${price.symbol}`;

      const newButton = Markup.callbackButton(text, action);
      if (innerIndex % 3 === 0) { outerIndex++; }
      buttons[outerIndex] ? buttons[outerIndex].push(newButton) : buttons.push([newButton]);
    });

    buttons.push([Markup.callbackButton(state.bot.buttons.settings.back, state.bot.actions.settings.back)]);

    const markup = Extra.markup(Markup.inlineKeyboard(buttons));

    return ctx.editMessageText(state.bot.messages.settings.pricePairs, markup);
  }

  const getWalletBalance = async (ctx) => {
    const userSettings = await db.getUserSettings(ctx.from.id);
    const wallet = await bitmex.trades.getWalletBalance(userSettings.bitmex.api);

    if (wallet.error) {
      return ctx.reply(wallet.message, getKeyboard(userSettings));
    }

    const message = formatter.getWalletBalanceMessage(wallet);
    return ctx.reply(message, getKeyboard(userSettings));
  }

  const commands = { start, help };
  const buttons = { prices, alerts, settings };
  const actions = { addPriceAlert, deletePriceAlert, handleSettingsActions };
  const trades = { getWalletBalance };

  module.exports = {
    commands,
    buttons,
    handleError,
    actions,
    trades,
    processTextInput
  };
})();
