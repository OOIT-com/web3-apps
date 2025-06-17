import {
  ArtworkEntry,
  ArtworkTimeProof,
  EncryptionKeyLocation
} from '../../contracts/artwork-time-proof/ArtworkTimeProof-support';
import { Web3Session } from '../../types';
import * as nacl from 'tweetnacl';
import { decrypt, encrypt } from '../../utils/nacl-util';
import { createSha256Hash } from '../../utils/crypto-util';
import { getMySecretKeyV2 } from '../../contracts/public-key-store/PublicKeyStoreV2-support';
import { resolveAsStatusMessage } from '../../utils/status-message-utils';
import { errorMessage, isStatusMessage, StatusMessage, warningMessage } from '../../utils/status-message';
import { EncryptionType } from './types';

export async function getMyArtworks(artworkTimeProof: ArtworkTimeProof): Promise<ArtworkEntry[] | StatusMessage> {
  const tag = '<getMyArtworks>';
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
    return resolveAsStatusMessage(tag, e);
  }
}

export type PrepareArtworkArgs = {
  encryptionType: EncryptionType;
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
  encryptionKeyLocation: EncryptionKeyLocation;
};
export const prepareArtwork = async ({
  encryptionType,
  secretKey,
  web3Session,
  artworkFile
}: PrepareArtworkArgs): Promise<StatusMessage | ArtworkPackage> => {
  let encryptionSecret: Uint8Array | undefined = undefined;
  let encryptionKeyLocation: EncryptionKeyLocation = 'external-key-pair';
  if (encryptionType === 'new-key-pair') {
    encryptionSecret = secretKey;
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

export type DecryptArtworkArgs = {
  encryptionKeyLocation: EncryptionKeyLocation;
  secretKey: Uint8Array;
  web3Session: Web3Session;
  artworkData: Uint8Array;
};

export const decryptArtwork = async ({
  encryptionKeyLocation,
  secretKey,
  web3Session,
  artworkData
}: DecryptArtworkArgs): Promise<StatusMessage | Uint8Array> => {
  let encryptionSecret: Uint8Array | undefined = undefined;

  if (encryptionKeyLocation === 'external-key-pair') {
    // encryptionSecret = secretKey;
    return warningMessage(`new-key-pair NOT IMPLEMENTED ${secretKey}`);
  }

  if (encryptionKeyLocation === 'public-key-pair-store') {
    const res = await getMySecretKeyV2(web3Session);
    if (isStatusMessage(res)) {
      return res;
    }
    encryptionSecret = res;
  }

  let decryptedData;
  if (encryptionSecret) {
    const { publicKey, secretKey } = nacl.box.keyPair.fromSecretKey(encryptionSecret);

    decryptedData = decrypt(secretKey, artworkData, publicKey);
    if (!decryptedData) {
      return errorMessage('Could not decrypt artwork data!');
    }
  }
  if (!decryptedData) {
    return errorMessage('Decryption of artwork data failed!');
  }
  return decryptedData;
};
