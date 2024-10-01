import { Buffer } from 'buffer';
import { decryptBuffer } from '../utils/metamask-util';

export const decryptFunMetamask = async (address: string, message: Uint8Array) => {
  const buff = Buffer.from(message);
  const buff1 = await decryptBuffer(address, buff);
  return new Uint8Array(buff1);
};

export async function getPublicKeyFromMetamask(address: string) {
  const w = window as any;
  return (await w?.ethereum?.request({
    method: 'eth_getEncryptionPublicKey',
    params: [address]
  })) as string;
}
