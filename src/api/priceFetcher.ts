import mongoose from 'mongoose'
import wrappedFetch from 'socks5-node-fetch'

const torHost = process.env.TOR_HOST || '127.0.0.1'
const torPort = process.env.TOR_PORT || 9050
const fetch = wrappedFetch({
    socksHost: torHost,
    socksPort: torPort
})

const Price = mongoose.model('Price')
import {logger} from '../logging'
import {HttpProxyAgent} from 'http-proxy-agent'

const currencies = [
    'AUD',
    'BRL',
    'CAD',
    'CHF',
    'CNY',
    'DKK',
    'EUR',
    'GBP',
    'HKD',
    'IDR',
    'NZD',
    'RUB',
    'SGD',
    'THB',
    'USD'
]

const priceUpdate = (content: { currency: string }) =>
    Price.updateOne(
        {currency: content.currency},
        content,
        {upsert: true, setDefaultsOnInsert: true},
        err => {
            if (err) logger.error(err)
            else logger.info(`Updated currency (${content.currency}) successfully`)
        }
    )

const fetchAndUpdatePrices = () => {
    const apiKey = process.env.CRYPTO_COMPARE_API_KEY || '93746a9ac911b2e240f68829794423f80ab36bddc344a2c385bc5eadcc52cfec'

    logger.info(`Start fetching currencies`)

    fetch(
        `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=XVG&tsyms=${currencies.join(',')}&api_key=${apiKey}`
    )
        .then(res => res.ok && res.json())
        .then(response => {
            const currencyDataSet = response.RAW.XVG

            for (const currency in currencyDataSet) {

                const currencyData = currencyDataSet[currency]
                const newPrice = {
                    price: currencyData.PRICE,
                    rank: 1,
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
                }

                priceUpdate(newPrice)
            }
        })
        .catch(e => {
            logger.error(e.message)
        })
}

fetchAndUpdatePrices()

setInterval(() => {
    logger.info('Price fetching interval')
    fetchAndUpdatePrices()
}, 3 * 60 * 1000)
