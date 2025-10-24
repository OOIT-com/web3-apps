import { combine, split } from 'shamir-secret-sharing';

export const createSharedSecret = async (
  secret: Uint8Array,
  nrOfMember: number,
  threshold: number
): Promise<Uint8Array[]> => {
  const res = await split(secret, nrOfMember, threshold);

  return res;
};

export const testPartsSecret = async (partialSecrets: Uint8Array[], secret: Uint8Array): Promise<boolean> => {
  const reconstructed = await combine(partialSecrets);
  // compare reconstructed and secret of equality
  const s = Buffer.from(secret).toString('base64');
  const r = Buffer.from(reconstructed).toString('base64');
  return r === s;
};

export const recreateSecret = async (partialSecrets: Uint8Array[]) => {
  return combine(partialSecrets);
};
