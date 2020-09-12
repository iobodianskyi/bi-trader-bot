# BitMEX Trader Bot

[![Build Status](https://travis-ci.org/iobodianskyi/bi-trader-bot.svg?branch=master)](https://travis-ci.org/iobodianskyi/bi-trader-bot)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/iobodianskyi/bi-trader-bot/compare)

Telegram bot for trading on [BitMEX](https://www.bitmex.com/) exchange. Built with [Nodejs](https://nodejs.org/), [socket.io](https://socket.io/), [telegraf.js](https://telegraf.js.org/) and [Firebase](https://firebase.google.com/)

[![Start Messaging](https://lh3.googleusercontent.com/fife/ABSRlIpPGRWVTp3rWqnSI5hmA4Tb0D0dBqzgTzyXj0hk083NnAETt9saeguUL6nLoSBFX40ExasUeeHP3tDW_8OxEPZAetYS_nuteKm0rwWg6MfrQy7GmWIRL6IDEepDZSnG_iOBIHSLfhmmeys7VujOSteOKtMWdsi4XDGawd0wUFDS_67AJ3i_YmPNHsCCtVqwK1FqjkSe0I2BvQIgoCfA8zNiAm6k24Aql9GmsiYcIYmHW-0BueV0JWGARKe7_dxyl35k9MXGaLjaIMAt9zZIroEPV2dK-cacrtVwLkfwDgi3gRosPRGpy1vhu8bWERFDsfnETYCSjh_xsnE0tn5LfnCu0RkKlvcqLhyget-uWn4pmgYpy_Zo84iYRT8E1-a5XZaI9SyjDGTPvrhNPOAAw46hi_EyfzoI3nh1UQ6vdW9p4H9ZxNOhXMW2HhiEP74SsH_OmynMOxxsGXTI9eEdVGNIevn5be1z26H6-nE6o4HBmCpcYF0JZ-GeWX4dTvE2xFE-60OeVrSaKeTMNSo2F7vRib817wFedyTFXxeNhrWLes3TsmvUVHx-gkyGH7L2Nmq50D3OR-GfO3RkZV2LTuVrNUYVytKhOe36NLRSfy1RIaRv121m5f50Z8LwrWhmPHhOvZg8lIEGKJuQ3fW5g5cmOdhAAysBW_CjopqLuIiwkeYcR6qFpRQZuFslXfQT2IOc6mjoq4_Og2fbBa99k_kUrBfJUX9D8eA=w3072-h1496-ft)](https://telegram.me/bi_trade_bot)

## Get started

Install `npm`

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
