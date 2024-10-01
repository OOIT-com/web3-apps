import sha256 from 'crypto-js/sha256';
import CryptoJS from 'crypto-js';

export async function createSha256Hash(file: File | Uint8Array): Promise<string> {
  let arrayBuffer;
  if (file instanceof File) {
    arrayBuffer = await file.arrayBuffer();
  } else {
    arrayBuffer = file;
  }
  const uint8Array = new Uint8Array(arrayBuffer);
  const data = Array.from(uint8Array);
  const wordArray = CryptoJS.lib.WordArray.create(data);
  const hash = sha256(wordArray);
  return hash.toString(CryptoJS.enc.Hex);
}
