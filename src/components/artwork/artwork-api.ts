import { ArtworkTimeProof, ArtworkEntry } from '../../contracts/artwork-time-proof/ArtworkTimeProof-support';
import { errorMessage, isStatusMessage, StatusMessage, Web3Session } from '../../types';
import * as nacl from 'tweetnacl';
import { encrypt } from '../../utils/nacl-util';
import { createSha256Hash } from '../../utils/crypto-util';
import { getMySecretKeyV2 } from '../../contracts/public-key-store/PublicKeyStoreV2-support';

export async function getMyArtworks(artworkTimeProof: ArtworkTimeProof): Promise<ArtworkEntry[] | StatusMessage> {
  try {
    const len = await artworkTimeProof.getMyArtworkCount();
    if (isStatusMessage(len)) {
      return len;
    }
    const items: ArtworkEntry[] = [];
    for (let index = 0; index < len; index++) {
      const entry = await artworkTimeProof.getMyArtwork(index);
      if (isStatusMessage(entry)) {
        return entry;
      } else {
        items.push(entry);
      }
    }
    return items;
  } catch (e) {
    return errorMessage('Serious Error', e);
  }
}

export type PrepareArtworkArgs = {
  encryptionType: string;
  secretKey: Uint8Array;
  web3Session: Web3Session;
  artworkFile: File;
};
export type ArtworkPackage = {
  encryptedData?: Uint8Array;
  encryptedDataHash: string;
  data: Uint8Array;

  dataHash: string;
  encryptionSecret?: Uint8Array;
  encryptionKeyLocation: string;
};
export const prepareArtwork = async ({
  encryptionType,
  secretKey,
  web3Session,
  artworkFile
}: PrepareArtworkArgs): Promise<StatusMessage | ArtworkPackage> => {
  let encryptionSecret: Uint8Array | undefined = undefined;
  let encryptionKeyLocation = '';
  if (encryptionType === 'new-key-pair') {
    encryptionSecret = secretKey;
    encryptionKeyLocation = 'external-key-pair';
  } else if (encryptionType === 'use-public-key-store-v2') {
    const res = await getMySecretKeyV2(web3Session);
    if (isStatusMessage(res)) {
      return res;
    }
    encryptionSecret = res;
    encryptionKeyLocation = 'public-key-pair-store';
  }

  const arrayBuffer = await artworkFile.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  const dataHash = await createSha256Hash(data);
  let encryptedData;
  let encryptedDataHash = '';
  if (encryptionSecret) {
    const { publicKey, secretKey } = nacl.box.keyPair.fromSecretKey(encryptionSecret);

    encryptedData = encrypt(secretKey, data, publicKey);
    if (!encryptedData) {
      return errorMessage('Could not encrypt data!');
    }
    encryptedDataHash = await createSha256Hash(encryptedData);
  }
  return { encryptedData, encryptedDataHash, data, dataHash, encryptionKeyLocation, encryptionSecret };
};
