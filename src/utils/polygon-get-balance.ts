import axios from 'axios';
import * as process from 'process';

import { errorMessage, StatusMessage } from './status-message';
// tutorial
export const getBlockchainBalance = async (address: string, isMainnet = true): Promise<StatusMessage | string> => {
  const prefix = isMainnet ? '' : '-testnet';
  const host = `https://api${prefix}.polygonscan.com`;
  console.log(`*** Polygon${prefix} get balance  ***`);
  const apikey = process.env.REACT_APP_POLYGONSCAN_API_KEY;
  const url = `${host}/api?module=account&action=balance&address=${address}&apikey=${apikey}`;
  const res = await axios.get(url, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (res.status === 200) {
    return res.data?.result || '';
  } else {
    return errorMessage('Request for Polygon balance failed!', `${res.status}, ${res.status}`);
  }
};
