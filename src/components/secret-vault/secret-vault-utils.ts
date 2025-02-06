import { Buffer } from 'buffer';

import { base64ToJson } from '../../utils/enc-dec-utils';
import { Web3Session } from '../../types';
import { Wallet } from 'alchemy-sdk';
import { decryptEthCrypto, encryptEthCrypto } from '../../utils/eth-crypto-utils';

export const decryptKeyBlockValue2 = async (
  web3Session: Web3Session,
  encMessage: string
): Promise<string | undefined> => {
  const { decryptFun, privateKey } = web3Session;

  // eth-crypto
  if (privateKey) {
    const message = await decryptEthCrypto(privateKey, encMessage);
    if (message !== undefined) {
      return message;
    }
  }

  // decryptFun
  if (decryptFun) {
    try {
      console.log('use: web3.decryptFun');
      let s1: any = null;
      const buff1 = Buffer.from(encMessage, 'base64');
      const inArray = new Uint8Array(buff1);
      const outArray = await decryptFun(inArray);
      if (outArray) {
        const content64 = Buffer.from(outArray).toString();
        s1 = base64ToJson(content64);
      }
      return s1?.value;
    } catch (e) {
      console.warn('web3.decryptFun failed!');
    }
  }
};

export const encryptKeyBlockValue2 = async (web3Session: Web3Session, message: string) => {
  const { privateKey } = web3Session;
  if (privateKey) {
    console.log('use: EthCrypto.encryptWithPublicKey');
    const w = new Wallet(privateKey);
    const encrypted = await encryptEthCrypto(w.publicKey, message);
    if (encrypted !== null) {
      return encrypted;
    }
  }
};
