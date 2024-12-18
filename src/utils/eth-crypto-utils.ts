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

export const encryptEthCryptoBinary = async (publicKey: string, data: Uint8Array): Promise<Uint8Array | undefined> => {
  const res = await encryptEthCrypto(publicKey, Buffer.from(data).toString());
  if (res) {
    return new Uint8Array(Buffer.from(res));
  }
};

export const decryptEthCryptoBinary = async (privateKey: string, data: Uint8Array): Promise<Uint8Array | undefined> => {
  const res = await decryptEthCrypto(privateKey, Buffer.from(data).toString());
  if (res) {
    return new Uint8Array(Buffer.from(res));
  }
};
