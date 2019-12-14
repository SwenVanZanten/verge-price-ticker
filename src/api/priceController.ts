import { Request, Response } from "express";
import fetch from "node-fetch";
import mongoose = require("mongoose");
const Price = mongoose.model("Price");
import { sendError, sendJSON } from "./defaultController";

export const getPriceByCurrency = async (req: Request, res: Response) => {
  if (!req.params.currency) {
    sendError(res, "you have to send a valid currency tag i.e. EUR");
  }

  try {
    const price = await Price.findOne({
      currency: req.params.currency.toUpperCase()
    });
    if (price) {
      const { _id, currency, ...rest } = price.toObject();
      sendJSON(res, rest);
    } else {
      sendErrorFindingCurrency(res);
    }
  } catch (e) {
    sendErrorFindingCurrency(res);
  }
};

const sendErrorFindingCurrency = (res: Response) => {
  sendError(
    res,
    "We weren't able to fetch your request, maybe check your currency input."
  );
};

export const getPriceChart = async (req: Request, res: Response) => {
  try {
    let from = req.params.from || 1414281564000
    let till = req.params.till || new Date().getTime()
      console.log(from, till)
    let interval = getIntervalByTimeDifference(till - from)
    fetch(`https://web-api.coinmarketcap.com/v1/cryptocurrency/quotes/historical?convert=USD&format=chart_crypto_details&id=693&interval=${interval}&time_end=${till}&time_start=${from}`)
      .then(response => response.json())
      .then(json => {
          let output = {
              market_cap_by_available_supply: [],
              price_btc: [],
              price_usd: [],
              volume_usd: []
          }

          for (let time in json.data) {
              if (!json.data.hasOwnProperty(time)) {
                  continue
              }

              let item = json.data[time]

              if (!item) {
                  continue
              }

              let timestamp = (new Date(time).getTime())
              // @ts-ignore
              output.price_usd.push([timestamp, item.USD[0]])
              // @ts-ignore
              output.volume_usd.push([timestamp, item.USD[1]])
          }

          sendJSON(res, output);
      });
  } catch (e) {
    sendError(res, "Couldn't fetch chart data.");
  }
};

const getIntervalByTimeDifference = (difference: number) => {
    switch (difference) {
        case 86400000:
            return '5m'
        case 604800000:
            return '15m'
        case 2592000000:
            return '1h'
        case 7866000000:
            return '2h'
        case 31536000000:
        default:
            return '1d'
    }
}
