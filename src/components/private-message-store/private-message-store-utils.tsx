import {
  EncryptMessageResult,
  PrivateMessageStore,
  web3ContentHash
} from '../../contracts/private-message-store/PrivateMessageStore-support';
import { PublicKeyStore } from '../../contracts/public-key-store/PublicKeyStore-support';
import { errorMessage, isStatusMessage, StatusMessage } from '../../types';
import { nNonce } from '../../utils/nacl-util';
import { resolveAsStatusMessage } from '../../utils/status-message-utils';
import { WrapFun } from '../AppContextProvider';

export const createInAndOutBox = async ({
  wrap,
  subject,
  text,
  publicKey,
  publicKeyStore,
  privateMessageStore,
  receiver
}: {
  wrap: WrapFun;
  privateMessageStore: PrivateMessageStore;
  subject: string;
  text: string;
  publicKey: string;
  publicKeyStore: PublicKeyStore;
  receiver: string;
}): Promise<
  | {
      inBox: EncryptMessageResult;
      outBox: EncryptMessageResult;
      contentHash: string;
    }
  | StatusMessage
> =>
  wrap('Encrypt Message...', async () => {
    try {
      const receiverPublicKey = await publicKeyStore.get(receiver);
      if (!receiverPublicKey) {
        return errorMessage('Receiver has no published PublicKey!');
      }
      if (isStatusMessage(receiverPublicKey)) {
        return receiverPublicKey;
      }
      const nonce = nNonce();
      const outBox = await privateMessageStore.encryptMessage({
        publicKey,
        subject,
        text,
        nonce
      });
      if (isStatusMessage(outBox)) {
        return outBox;
      }
      const inBox = await privateMessageStore.encryptMessage({
        publicKey: receiverPublicKey as string,
        subject,
        text,
        nonce
      });
      if (isStatusMessage(inBox)) {
        return inBox;
      }
      const contentHash = web3ContentHash(subject, text);
      return { inBox, outBox, contentHash };
    } catch (e) {
      return resolveAsStatusMessage('Could not create messages!', e);
    }
  });
