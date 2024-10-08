import Web3 from 'web3';
import { DecryptFun } from './components/login/connect-with-localstore';
import { AddressData } from './contracts/address-book/AddressBook-support';

export function isError(e: any): e is Error {
  return e?.message;
}

export type Web3SessionMode = 'metamask' | 'localstore';

export type Web3Session = {
  publicAddress: string;
  web3: Web3;
  networkId: number;
  publicKeyHolder?: PublicKeyHolder;
  decryptFun: DecryptFun;
  mode: Web3SessionMode;
  secret?: string;
};

export interface KeyBlockReduxState {
  statusMessage?: StatusMessage;
  snackbarMessage?: SnackbarMessage;
  loading?: string;

  // session data
  web3Session?: Web3Session;

  // key app data
  publicKeyHolderV2?: PublicKeyHolderV2;
  addressData?: AddressData[];
}

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
  arg && typeof arg === 'object' && arg.status && arg.userMessage;

export type NotifyInfoFun = (info?: string) => void;
export type NotifyFun = () => void;
export type NotifyRefresh = (refreshNeeded: boolean) => void;
export type NotifyStatusMessage = (statusMessage: StatusMessage) => void;

// APP TYPES

export type HolderType = 'wallet' | 'public-key-store';

export interface PublicKeyHolder {
  publicKey: string;
  origin: HolderType;
}

export interface PublicKeyHolderV2 {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
}

export type SnackbarMessage = StatusMessage & { duration: number; counter: number };

export type NetworkInfo = {
  name: string;
  chainId: number;
  currencySymbol: string;
  blockExplorerUrl: string;
  rpcUrl: string;
  PostFix: string;
  isMainnet: boolean;
  isEVM?: boolean;
  homePage?: string;
  faucetUrls?: string[];
};
