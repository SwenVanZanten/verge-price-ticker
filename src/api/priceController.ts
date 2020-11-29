import fetch from "node-fetch";
import mongoose from "mongoose";
const Price = mongoose.model("Price");
import { sendError, sendJSON } from "./defaultController";
import * as core from 'express-serve-static-core'

export const getPriceByCurrency = async (request: core.Request, res: core.Response) => {
  if (!request.params.currency) {
    sendError(res, "you have to send a valid currency tag i.e. EUR");
  }

  try {
    const price = await Price.findOne({
      currency: request.params.currency.toUpperCase()
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

const sendErrorFindingCurrency = (res: core.Response) => {
  sendError(
    res,
    "We weren't able to fetch your request, maybe check your currency input."
  );
};

export const getPriceChart = async (request: core.Request, res: core.Response) => {
  try {
    const from: number = (request.params.from || 1414281564000) as number
    const till: number = (request.params.till || new Date().getTime()) as number
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
  if (difference < 604800000) {
    return '5m'
  } else if (difference >= 604800000 && difference < 2592000000) {
    return '15m'
  } else if (difference >= 2592000000 && difference < 7866000000) {
    return '1h'
  } else if (difference >= 7866000000 && difference < 31536000000) {
    return '2h'
  } else {
    return '1d'
  }
}
