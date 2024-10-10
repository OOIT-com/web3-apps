import { Buffer } from 'buffer';
import { DecryptFun } from '../components/login/connect-with-localstore';
import { errorMessage, StatusMessage, Web3Session } from '../types';
import { encryptBuffer } from './metamask-util';
import { getPublicEncryptionKey } from '../components/public-key-store-v2/PublicKeyStoreV2Ui';
import { newBoxKeyPair } from './nacl-util';

export function hex2Uint8Array(hexString: string): Uint8Array {
  if (hexString.length % 2 !== 0) {
    console.error('Invalid hexString');
    return new Uint8Array();
  }
  const arrayBuffer = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    const byteValue = parseInt(hexString.substring(i, 2), 16);
    if (isNaN(byteValue)) {
      console.error('Invalid hexString');
      return new Uint8Array();
    }
    arrayBuffer[i / 2] = byteValue;
  }
  return arrayBuffer;
}

export function uint8Array2Hex(u: Uint8Array): string {
  return Buffer.from(u).toString('hex');
}

export function uint8Array2Base64(u: Uint8Array): string {
  return Buffer.from(u).toString('base64');
}

export function displayKey(s: string): string {
  if (!s || s.length < 11) {
    return s;
  }
  return `${s.substring(0, 6)}...${s.substring(s.length - 4)}`;
}

export function jsonToBase64(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj)).toString('base64');
}

export function base64ToJson(s: string): unknown {
  return JSON.parse(Buffer.from(s, 'base64').toString());
}

export function encryptText(text: string, publicKey: string): string | StatusMessage {
  try {
    const buff = encryptBuffer(publicKey, Buffer.from(text));
    return buff.toString('base64');
  } catch (e) {
    return errorMessage('Text Encryption Error!', e);
  }
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
  const { publicAddress, mode, publicKeyHolder } = web3Session;

  let publicKey: string | undefined = '';
  if (mode === 'localstore') {
    publicKey = publicKeyHolder?.publicKey;
  } else {
    publicKey = await getPublicEncryptionKey(publicAddress);
  }
  if (!publicKey) {
    return errorMessage('No Public Encryption Key available!');
  }
  return newEncSecretByPublicKey(publicKey);
}

export function newEncSecretByPublicKey(publicKey: string): string {
  const { secretKey } = newBoxKeyPair();
  const buff = encryptBuffer(publicKey, Buffer.from(secretKey));
  return buff.toString('base64');
}
