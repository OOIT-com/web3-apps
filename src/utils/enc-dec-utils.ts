import { Buffer } from 'buffer';
import { DecryptFun } from '../components/web3-local-wallet/connect-with-secret';
import { errorMessage, StatusMessage, Web3Session } from '../types';
import { newBoxKeyPair } from './nacl-util';
import { encryptEthCryptoBinary } from './eth-crypto-utils';

export function uint8Array2Hex(u: Uint8Array): string {
  return Buffer.from(u).toString('hex');
}

export function displayKey(s: string): string {
  if (!s || s.length < 11) {
    return s;
  }
  return `${s.substring(0, 6)}...${s.substring(s.length - 4)}`;
}

export function base64ToJson(s: string): unknown {
  return JSON.parse(Buffer.from(s, 'base64').toString());
}

export async function decryptText(text: string, decryptFun: DecryptFun): Promise<string | StatusMessage> {
  try {
    if (decryptFun) {
      const buff = Buffer.from(text, 'base64');
      const outArray = await decryptFun(new Uint8Array(buff));
      if (!outArray) {
        return errorMessage('Empty result for decryption!');
      }
      return Buffer.from(outArray).toString();
    } else {
      return errorMessage('No decryptFun available! Can not dencrypt!');
    }
  } catch (e) {
    return errorMessage('Text Decryption Error!', e);
  }
}

export async function decryptBase64(base64: string, decryptFun: DecryptFun): Promise<string | StatusMessage> {
  try {
    if (decryptFun) {
      const buff = Buffer.from(base64, 'base64');
      const outArray = await decryptFun(new Uint8Array(buff));
      if (!outArray) {
        return errorMessage('decryptBase64: Empty result by decryptFun!');
      }
      return Buffer.from(outArray).toString('base64');
    } else {
      return errorMessage('decryptBase64: No decryptFun available! Can not dencrypt!');
    }
  } catch (e) {
    return errorMessage('Text Decryption Error!', e);
  }
}

export async function newEncSecret(web3Session: Web3Session): Promise<string | StatusMessage> {
  const { publicKey } = web3Session;

  const res = await newEncSecretByPublicKey(publicKey);
  if (!res) {
    return errorMessage('No Public Encryption Key available!');
  }

  return res;
}

export const newEncSecretByPublicKey = async (publicKey: string): Promise<string | undefined> => {
  const { secretKey } = newBoxKeyPair();
  const res = await encryptEthCryptoBinary(publicKey, secretKey);
  if (res) {
    return Buffer.from(res).toString('base64');
  }
};
