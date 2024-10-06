// Source https://github.com/dchest/tweetnacl-js/wiki/Examples#box

import * as nacl from 'tweetnacl';
import { box, BoxKeyPair, randomBytes } from 'tweetnacl';
import { Buffer } from 'buffer';
import * as naclUtil from 'tweetnacl-util';
import { errorMessage } from '../types';
import { deflate, inflate } from 'pako';

export const newNonce = (): Uint8Array => randomBytes(box.nonceLength);
export const nNonce = (): number => parseInt(Buffer.from(randomBytes(5)).toString('hex'), 16);
export const newBoxKeyPair = (): BoxKeyPair => box.keyPair();

export const encrypt = (secretKey: Uint8Array, data: Uint8Array, publicKey: Uint8Array): Uint8Array => {
  const nonce = newNonce();
  const encrypted = box(data, nonce, publicKey, secretKey);
  const fullEncrypted = new Uint8Array(nonce.length + encrypted.length);
  fullEncrypted.set(nonce);
  fullEncrypted.set(encrypted, nonce.length);
  return fullEncrypted;
};

export const decrypt = (secretKey: Uint8Array, data: Uint8Array, publicKey: Uint8Array): Uint8Array | null => {
  const nonce = data.subarray(0, box.nonceLength);
  const contentOnly = data.subarray(box.nonceLength, data.length);
  return box.open(contentOnly, nonce, publicKey, secretKey);
};

export function secretKey64ToBoxKeyPair(secretKey64: string): BoxKeyPair {
  return nacl.box.keyPair.fromSecretKey(new Uint8Array(Buffer.from(secretKey64, 'base64')));
}

export function secretKey2BoxKeyPair(secretKeyHex: string): BoxKeyPair {
  if (secretKeyHex.startsWith('0x')) {
    secretKeyHex = secretKeyHex.substring(2);
  }
  return nacl.box.keyPair.fromSecretKey(new Uint8Array(Buffer.from(secretKeyHex, 'hex')));
}

export function mmPublicEncryptionKey(secretKeyHex: string): string {
  const keyPair = secretKey2BoxKeyPair(secretKeyHex);
  return naclUtil.encodeBase64(keyPair.publicKey);
}

export const EncPrefix = 'enc-';

export type CryptArgs = { data: string; secret: string | BoxKeyPair };

export const decryptContent = ({ data, secret }: CryptArgs) => {
  const keyPair = typeof secret === 'string' ? secretKey2BoxKeyPair(secret) : secret;
  if (data.startsWith(EncPrefix)) {
    data = data.substring(EncPrefix.length);
  }
  const { publicKey, secretKey } = keyPair;
  const encDataBuff = Buffer.from(data, 'base64');
  const encData = new Uint8Array(encDataBuff);
  const compressed = decrypt(secretKey, encData, publicKey);
  if (!compressed) {
    return errorMessage('Decryption of data failed!');
  }
  return inflate(compressed, { to: 'string' });
};

export const encryptContent = ({ data, secret }: CryptArgs) => {
  const keyPair = typeof secret === 'string' ? secretKey2BoxKeyPair(secret) : secret;
  const { publicKey, secretKey } = keyPair;
  const compressed = deflate(data);
  const encData = encrypt(secretKey, compressed, publicKey);
  return Buffer.from(encData).toString('base64');
};

export type CryptArgsForReceiver = { data: string; secret: string; receiverPublicKey: string };

export const encryptContentForReceiver = ({ data, secret, receiverPublicKey }: CryptArgsForReceiver) => {
  const compressed = deflate(data);
  const encData = encrypt(Buffer.from(secret, 'hex'), compressed, Buffer.from(receiverPublicKey, 'hex'));
  return Buffer.from(encData).toString('base64');
};

export type CryptArgsFromSender = { encData: string; secret: string; senderPublicKey: string };

export const decryptContentFromSender = ({ encData, secret, senderPublicKey }: CryptArgsFromSender): string | null => {
  const data = decrypt(Buffer.from(secret, 'hex'), Buffer.from(encData, 'base64'), Buffer.from(senderPublicKey, 'hex'));
  if (data === null) {
    return null;
  }
  return Buffer.from(inflate(data)).toString();
};
