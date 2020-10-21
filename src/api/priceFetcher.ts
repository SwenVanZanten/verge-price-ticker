import mongoose from "mongoose";
import fetch from "node-fetch";
const Price = mongoose.model("Price");
import priceTable from "./priceTable.json";
import { logger } from "../logging";

const priceUpdate = (content: { currency: string }) =>
  Price.updateOne(
    { currency: content.currency },
    content,
    { upsert: true, setDefaultsOnInsert: true },
    err => {
      if (err) logger.error(err);
      else logger.info(`Updated currency (${content.currency}) successfully`);
    }
  );

const fetchAndUpdatePrices = (currency: string) => {
  let apiKey = 'be39ea29032b0f6d5225143bf759ea2b6e8ce44d69f5f2ce3f40e4234733b383'

  fetch("https://api.coinpaprika.com/v1/ticker/xvg-verge")
    .then(res => res.ok && res.json())
    .then(({ rank }) => {
      fetch(
        `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=XVG&tsyms=${currency}&api_key=${apiKey}`
      )
        .then(res => res.ok && res.json())
        .then(({ RAW: { XVG: { [currency]: currencyData } }, ...rest }) => {
          const newPrice = {
            price: currencyData.PRICE,
            rank: rank,
            openday: currencyData.OPENDAY,
            highday: currencyData.HIGHDAY,
            lowday: currencyData.LOWDAY,
            open24Hour: currencyData.OPEN24HOUR,
            high24Hour: currencyData.HIGH24HOUR,
            low24Hour: currencyData.LOW24HOUR,
            change24Hour: currencyData.CHANGE24HOUR,
            changepct24Hour: currencyData.CHANGEPCT24HOUR,
            changeday: currencyData.CHANGEDAY,
            changepctday: currencyData.CHANGEPCTDAY,
            supply: currencyData.SUPPLY,
            mktcap: currencyData.MKTCAP,
            totalvolume24H: currencyData.TOTALVOLUME24H,
            totalvolume24Hto: currencyData.TOTALVOLUME24HTO,
            currency
          };

          priceUpdate(newPrice);
        });
    });
};

priceTable.currencies.forEach(({ currency }) => {
  logger.info(`Start fetching currency (${currency})`);
  fetchAndUpdatePrices(currency);
});

setInterval(() => {
  priceTable.currencies.forEach(({ currency }) => {
    logger.info(`Start fetching currency (${currency})`);
    fetchAndUpdatePrices(currency);
  });
}, 25 * 60 * 1000);
