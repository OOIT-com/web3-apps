import { Buffer } from 'buffer';

import { base64ToJson } from '../../utils/enc-dec-utils';
import { Web3Session } from '../../types';
import EthCrypto from 'eth-crypto';
import { deflate, inflate } from 'pako';
import { encryptContent } from '../../utils/metamask-util';
import { Wallet } from 'alchemy-sdk';

export const decryptKeyBlockValue2 = async (web3Session: Web3Session, value: string) => {
  const { decryptFun, secret } = web3Session;
  // eth-crypto
  if (secret) {
    try {
      console.log('use: EthCrypto.decryptWithPrivateKey');
      const deflatedMessage64 = await EthCrypto.decryptWithPrivateKey(secret, JSON.parse(value));
      const message = Buffer.from(inflate(Buffer.from(deflatedMessage64, 'base64'))).toString();
      console.debug('decrypted with EthCrypto.decryptWithPrivateKey');
      return message;
    } catch (e) {
      console.warn('EthCrypto.decryptWithPrivateKey failed!');
    }
  }

  // decryptFun
  if (decryptFun) {
    try {
      console.log('use: web3.decryptFun');
      let s1: any = null;
      const buff1 = Buffer.from(value, 'base64');
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
  const { publicKeyHolder, secret } = web3Session;

  if (publicKeyHolder) {
    if (secret) {
      try {
        console.log('use: EthCrypto.encryptWithPublicKey');
        const w = new Wallet(secret);
        const publicKey = w.publicKey.substring(2);
        const deflatedMessage64 = Buffer.from(deflate(Buffer.from(message))).toString('base64');
        const encrypted = await EthCrypto.encryptWithPublicKey(publicKey, deflatedMessage64);
        return JSON.stringify(encrypted);
      } catch (e) {
        console.warn('EthCrypto.encryptWithPublicKey failed!');
      }
    }
    console.log('use: mm-encryptContent');
    return encryptContent(publicKeyHolder.publicKey, {
      value: message,
      nonce: 'n' + Math.random()
    });
  }
};
