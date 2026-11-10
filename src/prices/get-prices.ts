import { useEffect, useState } from 'react';
import { errorMessage, StatusMessage } from '../shared/status-message';
import { FreeCryptoAPI } from '../freecryptoapi/freecryptoapi'; // Initialize with your API key const api

export type UsdPrice = { price: string; symbol: string; timestamp: string; updated: number };
const refreshInterval = 1000 * 60 * 30; // 30 minutes;;
const pricesCache: { [key: string]: UsdPrice } = {};
export type AlchemyPrice = {
  symbol: string;
  prices: { currency: string; value: string; lastUpdatedAt: string }[];
  error?: { message: string };
};
export const getCoinPricesFromAlchemy = async (symbols: string[]): Promise<AlchemyPrice[] | StatusMessage> => {
  // curl --request GET \
  //    --url 'https://api.g.alchemy.com/prices/v1/.../tokens/by-symbol?symbols=ETH&symbols=FTM&symbols=MATIC' \
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
    // getUsdPriceCoinApi(symbol).then((p) => {
    //   if (!isStatusMessage(p)) {
    //     setPrice(+p.price);
    //   } else {
    //     console.warn(`getUsdPriceCoinApi -> status message`, p);
    //   }
    // });

    getPriceInUSD(symbol)
      .then((price) => {
        if (price) {
          setPrice(+price.price);
        } else {
          console.warn(`getPricesUSD -> status message`, price);
        }
      })
      .catch(console.error);
  }, [symbol]);

  return price;
};

export const getPriceInUSD = async (symbol: string): Promise<UsdPrice | undefined> => {
  let cp: UsdPrice | undefined = pricesCache[symbol];
  if (cp) {
    if (cp.updated + refreshInterval < new Date().getTime()) {
      cp = undefined;
    }
  }

  if (!cp) {
    const freecryptokey = process.env.REACT_APP_FREECRYPTOAPI_API_KEY;
    if (!freecryptokey) {
      return;
    }
    const api = new FreeCryptoAPI(freecryptokey);
    const { status, symbols } = await api.getData(symbol);

    if (status !== 'success') {
      console.warn(`Did not find data for ${symbol} on freecrypto!`);
      return;
    }

    const res: { last: string; date: string } = symbols[0];
    cp = { symbol, price: res.last, timestamp: res.date, updated: Date.now() };
    pricesCache[cp.symbol] = cp;
  }
  return cp;
};
