import { secp256k1 } from '@noble/curves/secp256k1';
import { Buffer } from 'buffer';
import { deflate, inflate } from 'pako';

// Same wire format as eth-crypto / eccrypto, so existing ciphertexts stay readable:
// ECDH on secp256k1 -> SHA-512 of the shared x-coordinate -> AES-256-CBC key (first 32 bytes) + HMAC-SHA256 key (last 32 bytes).
// MAC covers iv | ephemPublicKey (uncompressed) | ciphertext.

type EncryptedPayload = {
  iv: string;
  ephemPublicKey: string;
  ciphertext: string;
  mac: string;
};

const subtle = crypto.subtle;

const strip0x = (value: string) => (value.startsWith('0x') ? value.substring(2) : value);

const hexToBytes = (hex: string): Uint8Array => new Uint8Array(Buffer.from(strip0x(hex), 'hex'));

const bytesToHex = (bytes: Uint8Array): string => Buffer.from(bytes).toString('hex');

const concatBytes = (...parts: Uint8Array[]): Uint8Array => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
};

const toPublicKeyBytes = (publicKey: string): Uint8Array => {
  const hex = strip0x(publicKey);
  // 64 bytes without the 04 prefix is the format used by eth-crypto
  return hexToBytes(hex.length === 128 ? '04' + hex : hex);
};

const deriveKeys = async (privateKey: Uint8Array, publicKey: Uint8Array) => {
  const shared = secp256k1.getSharedSecret(privateKey, publicKey);
  const px = shared.slice(1, 33);
  const hash = new Uint8Array(await subtle.digest('SHA-512', px));
  const aesKey = await subtle.importKey('raw', hash.slice(0, 32), { name: 'AES-CBC' }, false, ['encrypt', 'decrypt']);
  const macKey = await subtle.importKey('raw', hash.slice(32), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify'
  ]);
  return { aesKey, macKey };
};

export const encryptWithPublicKey = async (publicKey: string, message: string): Promise<EncryptedPayload> => {
  console.debug('using encryptWithPublicKey');
  const ephemPrivate = secp256k1.utils.randomPrivateKey();
  const ephemPublicKey = secp256k1.getPublicKey(ephemPrivate, false);
  const { aesKey, macKey } = await deriveKeys(ephemPrivate, toPublicKeyBytes(publicKey));

  const iv = crypto.getRandomValues(new Uint8Array(16));
  const ciphertext = new Uint8Array(
    await subtle.encrypt({ name: 'AES-CBC', iv }, aesKey, new TextEncoder().encode(message))
  );
  const mac = new Uint8Array(await subtle.sign('HMAC', macKey, concatBytes(iv, ephemPublicKey, ciphertext)));

  return {
    iv: bytesToHex(iv),
    ephemPublicKey: bytesToHex(ephemPublicKey),
    ciphertext: bytesToHex(ciphertext),
    mac: bytesToHex(mac)
  };
};

export const decryptWithPrivateKey = async (privateKey: string, encrypted: EncryptedPayload): Promise<string> => {
  console.debug('using decryptWithPrivateKey');
  const iv = hexToBytes(encrypted.iv);
  const ephemPublicKey = hexToBytes(encrypted.ephemPublicKey);
  const ciphertext = hexToBytes(encrypted.ciphertext);
  const mac = hexToBytes(encrypted.mac);

  const { aesKey, macKey } = await deriveKeys(hexToBytes(privateKey), ephemPublicKey);

  const valid = await subtle.verify('HMAC', macKey, mac, concatBytes(iv, ephemPublicKey, ciphertext));
  if (!valid) {
    throw new Error('Bad MAC');
  }
  const plain = await subtle.decrypt({ name: 'AES-CBC', iv }, aesKey, ciphertext);
  return new TextDecoder().decode(plain);
};

export const decryptEthCrypto = async (privateKey: string, value: string): Promise<string | undefined> => {
  console.debug('using decryptEthCrypto');
  try {
    const deflatedMessage64 = await decryptWithPrivateKey(privateKey, JSON.parse(value));
    return Buffer.from(inflate(Buffer.from(deflatedMessage64, 'base64'))).toString();
  } catch (e) {
    console.warn('decryptEthCrypto failed!');
  }
};

export const encryptEthCrypto = async (publicKey: string, message: string): Promise<string | undefined> => {
  console.debug('using encryptEthCrypto');
  try {
    const deflatedMessage64 = Buffer.from(deflate(Buffer.from(message))).toString('base64');
    const encrypted = await encryptWithPublicKey(publicKey, deflatedMessage64);
    return JSON.stringify(encrypted);
  } catch (e) {
    console.warn('encryptWithPublicKey failed!');
  }
};

export const encryptEthCryptoBinary = async (publicKey: string, data: Uint8Array): Promise<Uint8Array | undefined> => {
  console.debug('using encryptEthCryptoBinary');
  const res = await encryptEthCrypto(publicKey, Buffer.from(data).toString('base64'));
  if (res) {
    return new Uint8Array(Buffer.from(res));
  }
};

export const decryptEthCryptoBinary = async (privateKey: string, data: Uint8Array): Promise<Uint8Array | undefined> => {
  console.debug('using decryptEthCryptoBinary');
  const res = await decryptEthCrypto(privateKey, Buffer.from(data).toString());
  if (res) {
    return new Uint8Array(Buffer.from(res, 'base64'));
  }
};
