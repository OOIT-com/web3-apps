import { DecryptFun } from './components/web3-local-wallet/connect-with-secret';
import Web3 from 'web3';

export function isError(e: any): e is Error {
  return e?.message;
}

export type Web3Session = {
  web3: Web3;
  networkId: number;
  // Deprecated
  decryptFun: DecryptFun;
  publicAddress: string;
  publicKey: string;
  privateKey: string;
};

export declare type StatusMessageStatus = 'success' | 'info' | 'warning' | 'error';

export declare type StatusMessage = {
  status: StatusMessageStatus;
  userMessage?: string;
  systemMessage?: string;
  additionalSystemMessages?: string[];
};
export const errorMessage = (userMessage: string, error: Error | string | unknown = ''): StatusMessage => {
  const status = 'error';
  let systemMessage;
  if (!error) {
    systemMessage = '';
  } else if (isError(error)) {
    systemMessage = error.message;
  } else if (typeof error === 'string') {
    systemMessage = error;
  } else {
    systemMessage = error.toString();
  }
  return {
    status,
    userMessage,
    systemMessage
  };
};

export const warningMessage = (userMessage: string): StatusMessage => ({
  status: 'warning',
  userMessage: userMessage
});
export const infoMessage = (userMessage: string): StatusMessage => ({
  status: 'info',
  userMessage: userMessage
});
export const successMessage = (userMessage: string): StatusMessage => ({
  status: 'success',
  userMessage: userMessage
});

export const isStatusMessage = (arg: any): arg is StatusMessage =>
  !!(arg && typeof arg === 'object' && arg.status && arg.userMessage);

export type NotifyInfoFun = (info?: string) => void;
export type NotifyFun = () => void;
export type NotifyCommandFun<T = string> = (command: T) => void;

export type NotifyRefresh = (refreshNeeded: boolean) => void;
export type NotifyStatusMessage = (statusMessage: StatusMessage) => void;

export type SnackbarMessage = StatusMessage & { duration: number; counter: number };
export type CurrencySymbol = 'ETH' | 'MATIC' | 'BNB' | 'FTM' | 'S' | 'tFIL' | 'AVAX' | 'FIL' | 'MOVR' | 'ONE' | 'n/a';

export type NetworkInfo = {
  name: string;
  chainId: number;
  currencySymbol: CurrencySymbol;
  blockExplorerUrl: string;
  rpcUrl: string;
  PostFix: string;
  isMainnet: boolean;
  isEVM?: boolean;
  homePage?: string;
  faucetUrls?: string[];
  irysTokenname?: string;
};
