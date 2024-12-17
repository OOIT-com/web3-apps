import EthCrypto from 'eth-crypto';
import { Buffer } from 'buffer';
import { deflate, inflate } from 'pako';

export const decryptEthCrypto = async (privateKey: string, value: string): Promise<string | undefined> => {
  try {
    const deflatedMessage64 = await EthCrypto.decryptWithPrivateKey(privateKey, JSON.parse(value));
    return Buffer.from(inflate(Buffer.from(deflatedMessage64, 'base64'))).toString();
  } catch (e) {
    console.warn('decryptEthCrypto failed!');
  }
};

export const encryptEthCrypto = async (publicKey: string, message: string): Promise<string | undefined> => {
  try {
    const deflatedMessage64 = Buffer.from(deflate(Buffer.from(message))).toString('base64');
    const encrypted = await EthCrypto.encryptWithPublicKey(publicKey, deflatedMessage64);
    return JSON.stringify(encrypted);
  } catch (e) {
    console.warn('EthCrypto.encryptWithPublicKey failed!');
  }
};
