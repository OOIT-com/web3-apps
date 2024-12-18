// https://betterprogramming.pub/exchanging-encrypted-data-on-blockchain-using-metamask-a2e65a9a896c

import { encrypt } from '@metamask/eth-sig-util';
import { Buffer } from 'buffer';
import * as nacl from 'tweetnacl';
import * as naclUtil from 'tweetnacl-util';

export function encryptBuffer(publicKey: string, data: Buffer): Buffer {
  // Returned object contains 4 properties: version, ephemPublicKey, nonce, ciphertext
  // Each contains data encoded using base64, version is always the same string
  const enc = encrypt({
    publicKey,
    data: data.toString('base64'),
    version: 'x25519-xsalsa20-poly1305'
  });

  // We want to store the data in smart contract, therefore we concatenate them
  // into single Buffer
  return Buffer.concat([
    Buffer.from(enc.ephemPublicKey, 'base64'),
    Buffer.from(enc.nonce, 'base64'),
    Buffer.from(enc.ciphertext, 'base64')
  ]);
}

export function encryptData(publicKey: string, data: Buffer): string {
  return encryptBuffer(publicKey, data).toString('base64');
}

export async function decryptBuffer(publicAddress: string, data: Buffer): Promise<Buffer> {
  // Reconstructing the original object outputed by encryption
  const structuredData = {
    version: 'x25519-xsalsa20-poly1305',
    ephemPublicKey: data.subarray(0, 32).toString('base64'),
    nonce: data.subarray(32, 56).toString('base64'),
    ciphertext: data.subarray(56).toString('base64')
  };
  // Convert data to hex string required by MetaMask
  const ct = `0x${Buffer.from(JSON.stringify(structuredData), 'utf8').toString('hex')}`;
  // Send request to MetaMask to decrypt the ciphertext
  // Once again application must have access to the publicAddress
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  const decrypt = await w?.ethereum?.request({
    method: 'eth_decrypt',
    params: [ct, publicAddress]
  });
  // Decode the base85 to final bytes
  return Buffer.from(decrypt, 'base64');
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

// NaCl/TweetNaCl use the Montgomery Curve25519 curve for key exchange (for "box"),
// but the Twisted Edwards Ed25519 curve for signing.
// The public keys cannot directly be used interchangeably.

// The public key returned by eth_getEncryptionPublicKey is not the one used for transactions and
// messages. From their docs The public key is computed from entropy associated with the specified
// user account, using the nacl implementation of the X25519_XSalsa20_Poly1305 algorithm.
// eth-sig-util has encryption and decryption that shouldn't require metamask interaction.
// Looking at EthCrypto package it uses ECCrypto which uses a different algorithm for encryption.
