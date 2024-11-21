import { errorMessage, isStatusMessage, StatusMessage } from '../types';
import { useEffect, useState } from 'react';

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
      pricesCache[p.symbol] = { ...p, updated: Date.now() };
    });
  }

  return prices;
};

type CoinApiCacheType = { [key: string]: UsdPrice };
const coinApiCache: CoinApiCacheType = {};
export const getUsdPriceCoinApi = async (symbol: string): Promise<UsdPrice | StatusMessage> => {
  if (coinApiCache[symbol] && coinApiCache[symbol].updated + refreshInterval > new Date().getTime()) {
    return coinApiCache[symbol];
  }
  //   curl -L 'https://rest.coinapi.io/v1/exchangerate/BTC?filter_asset_id=USD' \
  // -H 'Accept: text/plain' \
  // -H 'X-CoinAPI-Key: 4B836DE4-CAC9-47FC-8833-D6166CAE5458'
  try {
    const coinApiKey = process.env.REACT_APP_COIN_API_KEY ?? '';
    const url = `https://rest.coinapi.io/v1/exchangerate/${symbol}?filter_asset_id=USD`;
    const headers = {
      accept: 'text/plain',
      'X-CoinAPI-Key': coinApiKey
    };

    const response = await fetch(url, {
      method: 'GET',
      headers
    });
    const resp = await response.json();
    if (resp.error) {
      return errorMessage(resp.error);
    } else {
      const r = resp.rates[0];
      if (r?.rate) {
        const usdPrice = { price: r.rate, symbol, timestamp: r.time, updated: Date.now() };
        coinApiCache[symbol] = usdPrice;
        return usdPrice;
      }
    }
    return errorMessage(`No price found for ${symbol}`);
  } catch (e) {
    return errorMessage(`Failed to get price for ${symbol}`, e);
  }
};

// export const displayUsdPrice = async ({
//   web3Session,
//   amount,
//   symbol
// }: {
//   web3Session?: Web3Session;
//   amount: string | number;
//   symbol?: string;
// }): Promise<string> => {
//   if (web3Session && !symbol) {
//     const ni = getNetworkInfo(web3Session.networkId);
//     symbol = ni.currencySymbol;
//   }
//   if (!symbol) {
//     return amount.toString();
//   }
//   const price = await getUsdPriceCoinApi(symbol);
//   if (!isStatusMessage(price)) {
//     const usdAmount = parseFloat(amount.toString()) * parseFloat(price.price);
//     return `${amount} ($${usdAmount})`;
//   }
//   return amount.toString();
// };

export const displayUsdPrice = ({
  amount,
  symbol,
  usdPrice
}: {
  amount: string | number;
  symbol: string;
  usdPrice: number | undefined;
}): string => {
  if (usdPrice) {
    const usdAmount = parseFloat(amount.toString()) * usdPrice;
    return `${amount} ${symbol} ($${usdAmount.toFixed(2)} USD)`;
  }
  return `${amount} ${symbol}`;
};

export const useUsdPrice = (symbol: string): number | undefined => {
  const [price, setPrice] = useState<number | undefined>(undefined);
  useEffect(() => {
    getUsdPriceCoinApi(symbol).then((p) => {
      if (!isStatusMessage(p)) {
        setPrice(+p.price);
      }
    });
  }, [symbol]);
  return price;
};
