import { keccak256, Wallet } from 'ethers';
import { Wallet as AlchemyWallet } from 'alchemy-sdk';

export const keccakFromString = (s: string): string => {
  if (!s) {
    return s;
  }
  return keccak256(Buffer.from(s)).toString();
};

//https://docs.ethers.org/v6/api/wallet/#KeystoreAccount
export const isPrivateKey = (content: string): boolean => {
  try {
    new Wallet(content);
    return true;
  } catch (e) {
    return false;
  }
};

export const isMnemonic = (content: string): boolean => {
  try {
    AlchemyWallet.fromMnemonic(content);
    return true;
  } catch (e) {
    return false;
  }
};
