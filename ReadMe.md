# bi-trader-bot

Telegram bot for trading on BitMEX exchange. Built with [Nodejs](https://nodejs.org/), [telegraf.js](https://telegraf.js.org/) and [Firebase](https://firebase.google.com/)

## Get started

Install all required packages with `npm install`

## Setup

`npm install`

Navigate to `/src/config/` and place Firestore keys into `firestoreKeys.json`

Run in that folder `git update-index --assume-unchanged firestoreKeys.json` to ignore local git changes

`npm start` to start. Server started on `http://localhost:9004/`.
