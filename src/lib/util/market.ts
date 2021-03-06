import { Currency } from "@renex/react-components";
import { Map } from "immutable";

import { TokenPrices } from "../../store/types/general";

export enum Token {
    DAI = "DAI",
    BTC = "BTC",
    ETH = "ETH",
    REN = "REN",
    TUSD = "TUSD",
    ZEC = "ZEC",
    WBTC = "WBTC",
}
// export type MarketPair = string;

const CoinGeckoIDs = Map<Token, string>()
    .set(Token.DAI, "dai")
    .set(Token.BTC, "bitcoin")
    .set(Token.ETH, "ethereum")
    .set(Token.REN, "republic-protocol")
    .set(Token.TUSD, "true-usd")
    .set(Token.ZEC, "zcash")
    .set(Token.WBTC, "bitcoin");

/**
 * Retrieves the current pricepoint for two currencies.
 * @param fstCode The first currency.
 * @param sndCode The second currency.
 * @returns An array containing the price with respect to the currencies, and the 24 hour percent change.
 */
const fetchDetails = async (geckoID: string) => {
    const url = `https://api.coingecko.com/api/v3/coins/${geckoID}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
    const response = await fetch(url);
    return response.json();
};

export const getMarketPrice = async (quoteCode: Token, baseCode: Token): Promise<[number, number]> => {
    const baseCoinGeckoID = CoinGeckoIDs.get(baseCode, undefined);
    if (baseCoinGeckoID === undefined) {
        return [0, 0];
    }

    const baseData = await fetchDetails(baseCoinGeckoID);
    const basePrice: number | null | undefined = baseData.market_data.current_price[quoteCode.toLowerCase()];
    const basePercentChange: number | null | undefined = baseData.market_data.price_change_percentage_24h_in_currency[quoteCode.toLowerCase()];

    if (basePrice !== undefined && basePrice !== null) {
        return [basePrice || 0, basePercentChange || 0];
    }

    // If the pairing isn't available, use BTC as a conversion bridge.
    const bridge = Token.BTC;

    const quoteCoinGeckoID = CoinGeckoIDs.get(quoteCode, undefined);
    if (quoteCoinGeckoID === undefined) {
        return [0, 0];
    }

    const basePriceInBridge: number = (baseData.market_data.current_price[bridge.toLowerCase()] || 0);
    const basePercentChangeInBridge: number = (baseData.market_data.price_change_percentage_24h_in_currency[bridge.toLowerCase()] || 0);

    const quoteData = await fetchDetails(quoteCoinGeckoID);
    const quotePriceInBridge: number = quoteData.market_data.current_price[bridge.toLowerCase()] || 0;
    const quotePercentChangeInBridge: number = quoteData.market_data.price_change_percentage_24h_in_currency[bridge.toLowerCase()] || 0;
    return [
        quotePriceInBridge ? basePriceInBridge / quotePriceInBridge : 0,
        quotePercentChangeInBridge ? basePercentChangeInBridge / quotePercentChangeInBridge : 0
    ];
};

export const getTokenPricesInCurrencies = async (): Promise<TokenPrices> => {
    let prices: TokenPrices = Map();

    for (const tokenAndDetails of CoinGeckoIDs.toSeq().toArray()) {
        const [token, coinGeckoID] = tokenAndDetails;

        // tslint:disable-next-line:max-line-length
        const data = await fetchDetails(coinGeckoID);
        const price = Map<Currency, number>(data.market_data.current_price);

        prices = prices.set(token, price);
    }

    return prices;
};
