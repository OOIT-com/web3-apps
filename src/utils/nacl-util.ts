// Source https://github.com/dchest/tweetnacl-js/wiki/Examples#box

import * as nacl from 'tweetnacl';
import { box, BoxKeyPair, randomBytes } from 'tweetnacl';
import { Buffer } from 'buffer';
import * as naclUtil from 'tweetnacl-util';
import { deflate, inflate } from 'pako';
import { errorMessage } from '../shared/status-message';

export const newNonce = (): Uint8Array => randomBytes(box.nonceLength);
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
export type CryptArgsForReceiver = { data: string; senderSecretKey: Uint8Array; receiverPublicKey: Uint8Array };

export const encryptContentForReceiver = ({ data, senderSecretKey, receiverPublicKey }: CryptArgsForReceiver) => {
  const compressed = deflate(data);
  const encData = encrypt(senderSecretKey, compressed, receiverPublicKey);
  return Buffer.from(encData).toString('base64');
};

export type CryptArgsFromSender = { encData: string; receiverSecretKey: Uint8Array; senderPublicKey: Uint8Array };

export const decryptContentFromSender = ({
  encData,
  receiverSecretKey,
  senderPublicKey
}: CryptArgsFromSender): string | null => {
  const data = decrypt(receiverSecretKey, Buffer.from(encData, 'base64'), senderPublicKey);
  if (data === null) {
    return null;
  }
  return Buffer.from(inflate(data)).toString();
};
export function encryptBuffer(publicKey: string, data: Buffer): Buffer {
  // Returned object contains 4 properties: version, ephemPublicKey, nonce, ciphertext
  // Each contains data encoded using base64, version is always the same string
  // const enc = encrypt({
  //   publicKey,
  //   data: data.toString('base64'),
  //   version: 'x25519-xsalsa20-poly1305'
  // });
  //
  // // We want to store the data in smart contract, therefore we concatenate them
  // // into single Buffer
  // return Buffer.concat([
  //   Buffer.from(enc.ephemPublicKey, 'base64'),
  //   Buffer.from(enc.nonce, 'base64'),
  //   Buffer.from(enc.ciphertext, 'base64')
  // ]);
  return Buffer.from('');
}

export function encryptStandalone(publicKey: Uint8Array, data: Uint8Array): Uint8Array {
  // generate ephemeral keypair
  const ephemeralKeyPair = nacl.box.keyPair();

  const nonce = nacl.randomBytes(nacl.box.nonceLength);

  // encrypt
  const encryptedMessage = nacl.box(data, nonce, publicKey, ephemeralKeyPair.secretKey);

  const e0 = Buffer.from(naclUtil.encodeBase64(ephemeralKeyPair.publicKey), 'base64');
  const e1 = Buffer.from(naclUtil.encodeBase64(nonce), 'base64');
  const e2 = Buffer.from(naclUtil.encodeBase64(encryptedMessage), 'base64');
  const buf = Buffer.concat([e0, e1, e2]);

  return new Uint8Array(buf);
}

export function decryptStandalone(secretKey: Uint8Array, encData: Uint8Array): Uint8Array | null {
  const publicKey = encData.subarray(0, 32);
  const nonce = encData.subarray(32, 32 + nacl.box.nonceLength);
  const data = encData.subarray(32 + nacl.box.nonceLength);

  // encrypt
  if (!data || !nonce || !publicKey) {
    return null;
  }
  return nacl.box.open(data, nonce, publicKey, secretKey);
}
