(async () => {
  'use strict';

  const Markup = require('telegraf/markup');
  const Extra = require('telegraf/extra');

  const state = require('../state');
  const db = require('../db');
  const botApi = require('./api');
  const bitmex = require('../bitmex/api');
  const formatter = require('../formatter');

  const getKeyboard = () => {
    return Markup
      .keyboard([
        [state.bot.buttons.prices, state.bot.buttons.alerts],
        [state.bot.buttons.settings]])
      .resize()
      .extra();
  }

  const getSettingsInlineKeyboard = () => {
    return Extra.markup(Markup.inlineKeyboard([
      Markup.callbackButton(state.bot.buttons.settingsPricePairs, state.bot.actions.settings.pricePairs),
      Markup.callbackButton(state.bot.buttons.settingsTades, state.bot.actions.settings.trades)
    ]))
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

    ctx.reply(welcomeMessage, getKeyboard());
  }

  const help = async (ctx) => {
    const helpMessage = formatter.getMessage(state.bot.messages.help);
    return ctx.reply(helpMessage, getKeyboard());
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

    return ctx.reply(message, getKeyboard());
  }

  const alerts = async (ctx) => {
    await sendAlertsMessage(ctx);
    await db.setUserLastAction(ctx.from.id, state.bot.actions.alerts);
  }

  const settings = async (ctx) => {
    ctx.deleteMessage();

    return ctx.reply(state.bot.messages.settings, getSettingsInlineKeyboard());
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
    switch (userSettings.lastAction.id) {
      case state.bot.actions.addPriceAlert:
      case state.bot.actions.addedPriceAlert: {
        // add new price alert

        let price = parseFloat(ctx.update.message.text.replace(',', '.'));

        if (isNaN(price)) {
          return ctx.reply(state.bot.messages.incorrectPriceForAlert);
        }

        // by default pair is XBTUSD
        const symbol = 'XBTUSD';
        await db.addPriceAlert(ctx.from.id, symbol, price);
        await db.setUserLastAction(ctx.from.id, state.bot.actions.addedPriceAlert);
        await sendAlertsMessage(ctx);

        break;
      }
      case state.bot.actions.unknownText: {
        return ctx.reply(state.bot.messages.cannotGetYou);
      }
      default: {
        await db.setUserLastAction(ctx.from.id, state.bot.actions.unknownText);
        return ctx.reply(state.bot.messages.cannotGetYou);
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
      case state.bot.actions.settings.trades: {
        return ctx.editMessageText(
          'In development',
          Extra.markup(Markup.inlineKeyboard([]))
        );
      }
      case state.bot.actions.settings.back: {
        return ctx.editMessageText(
          state.bot.messages.settings,
          getSettingsInlineKeyboard());
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

    buttons.push([Markup.callbackButton(state.bot.buttons.settingsBack, state.bot.actions.settings.back)]);

    const markup = Extra.markup(Markup.inlineKeyboard(buttons));

    return ctx.editMessageText(state.bot.messages.settingsPricePairs, markup);
  }

  const commands = { start, help };
  const buttons = { prices, alerts, settings };
  const actions = { addPriceAlert, deletePriceAlert, handleSettingsActions };

  module.exports = {
    commands,
    buttons,
    handleError,
    actions,
    processTextInput
  };
})();
