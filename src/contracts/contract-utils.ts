import { getNetworkInfo } from '../network-info';
import { BigNumber } from 'alchemy-sdk';
import { StatusMessage } from '../utils/status-message';

export const toUserMessage = (statusMessage: StatusMessage) => {
  const sm = { ...statusMessage, systemMessage: statusMessage.userMessage };
  switch (statusMessage.status) {
    case 'success':
      return { ...sm, userMessage: 'Refresh might be needed!' };
    case 'info':
      return { ...sm, userMessage: 'Refresh might be needed!' };
    case 'warning':
      return { ...sm, userMessage: 'Warn message!' };
    case 'error':
      return { ...sm, userMessage: 'An blockchain error occurred' };
  }
  return statusMessage;
};

export enum ContractName {
  KEY_BLOCK = 'KEY_BLOCK',
  PUBLIC_KEY_STORE = 'PUBLIC_KEY_STORE',
  PRIVATE_MESSAGE_STORE = 'PRIVATE_MESSAGE_STORE',
  PRIVATE_MESSAGE_STORE_V2 = 'PRIVATE_MESSAGE_STORE_V2',
  UNIQUE_NAME_STORE = 'UNIQUE_NAME_STORE',
  ARTWORK_TIME_PROOF = 'ARTWORK_TIME_PROOF',
  CONTRACT_REGISTRY = 'CONTRACT_REGISTRY',
  ADDRESS_BOOK = 'ADDRESS_BOOK',
  PUBLIC_KEY_STORE_V2 = 'PUBLIC_KEY_STORE_V2',
  SALARY_MANAGER_ = 'SALARY_MANAGER_',
  SECURE_BLOCKCHAIN_TABLE = 'SECURE_BLOCKCHAIN_TABLE',
  UNIVERSAL_NAME_STORE = 'UNIVERSAL_NAME_STORE'
}

export function getContractAddress(chainId: number, contractName: ContractName | string): string {
  const network = getNetworkInfo(chainId);
  const envName = `REACT_APP_${contractName}_${network.PostFix}`;
  return (process.env[envName] ?? '').toLowerCase();
}

export const toNumber = (o: number | BigNumber | string): number => (typeof o === 'number' ? o : +o.toString());
