import { errorMessage, isStatusMessage, StatusMessage } from '../types';

export type UsdPrice = { price: string; symbol: string; timestamp: string; updated: number };
const refreshInterval = 1000 * 60 * 5; // 5 minutes;
const pricesCache: { [key: string]: UsdPrice } = {};
export type AlchemyPrice = {
  symbol: string;
  prices: { currency: string; value: string; lastUpdatedAt: string }[];
  error?: { message: string };
};
export const getPrices = async (symbols: string[]): Promise<AlchemyPrice[] | StatusMessage> => {
  // curl --request GET \
  //    --url 'https://api.g.alchemy.com/prices/v1/0AlwmJnKQyiHCeohP7bxM-yo9y_XDmzq/tokens/by-symbol?symbols=ETH&symbols=FTM&symbols=MATIC' \
  //    --header 'accept: application/json'
  // do a fetch to the Alchemy API

  const alchemyKey = process.env.REACT_APP_ALCHEMY_API_KEY;
  const url = `https://api.g.alchemy.com/prices/v1/${alchemyKey}/tokens/by-symbol?${symbols
    .map((s) => `symbols=${s}`)
    .join('&')}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      accept: 'application/json'
    }
  });
  const resp = await response.json();
  if (resp?.error?.message) {
    return errorMessage(resp.error.message);
  } else {
    return resp.data;
  }
};

export const getPricesUSD = async (symbols: string[]): Promise<UsdPrice[] | StatusMessage> => {
  const data = await getPrices(symbols);
  if (isStatusMessage(data)) {
    return data;
  }
  return data.map(({ symbol, prices }) => {
    const usd = prices.find((price) => price.currency === 'usd');
    if (usd) {
      return { price: usd.value, symbol, timestamp: usd.lastUpdatedAt, updated: 0 };
    } else {
      return { price: '', symbol, timestamp: '', updated: 0 };
    }
  });
};

export const getUsdPricesCached = async (symbols: string[]): Promise<UsdPrice[] | StatusMessage> => {
  const prices: UsdPrice[] = [];
  const remainingSymbols: string[] = [];
  symbols.forEach((s) => {
    const cp = pricesCache[s];
    if (cp) {
      if (cp.updated + refreshInterval > new Date().getTime()) {
        delete pricesCache[s];
      } else {
        prices.push(cp);
      }
    } else {
      remainingSymbols.push(s);
    }
  });

  const remainingPrices = await getPricesUSD(remainingSymbols);

  if (isStatusMessage(remainingPrices)) {
    return remainingPrices;
  } else {
    remainingPrices.forEach((p) => {
      prices.push(p);
      pricesCache[p.symbol] = { ...p, updated: new Date().getTime() };
    });
  }

  return prices;
};
