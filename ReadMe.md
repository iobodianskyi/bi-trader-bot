# BitMEX Trader Bot
[![Start Messaging](https://img.techpowerup.org/200322/bi-traber-bot-start-3-1.png)](https://telegram.me/bi_trade_bot)

Telegram bot for trading on [BitMEX](https://www.bitmex.com/) exchange. Built with [Nodejs](https://nodejs.org/), [socket.io](https://socket.io/), [telegraf.js](https://telegraf.js.org/) and [Firebase](https://firebase.google.com/)

[![Build Status](https://travis-ci.org/iobodianskyi/bi-trader-bot.svg?branch=master)](https://travis-ci.org/iobodianskyi/bi-trader-bot)

## Get started

### Install `npm`

`npm` is installed with Node.js [Download Node.js and npm](https://nodejs.org/)

Install all required packages with `npm install`

## Setup

Navigate to `/src/config/` and place Firestore keys into `firestoreKeys.json`

Run in that folder `git update-index --assume-unchanged firestoreKeys.json` to ignore local git changes

Server uses live socket quote updates from BitMEX. Available [here](https://www.bitmex.com/app/wsAPI)

Run `npm start` to start. Server started on `http://localhost:9004/`

## Contributing

Contributions of all sizes are welcome. You can also help by [reporting bugs](https://github.com/iobodianskyi/bi-trader-bot/issues/new).

## License

This project is under the [MIT License](./LICENSE) 
