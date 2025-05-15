import { DecryptFun } from './components/web3-local-wallet/connect-with-secret';
import Web3 from 'web3';
import { StatusMessage } from './utils/status-message';

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
