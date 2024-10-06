import {
  EncryptMessageResult,
  PrivateMessageStore,
  web3ContentHash
} from '../../contracts/private-message-store/PrivateMessageStore-support';
import { PublicKeyStore } from '../../contracts/public-key-store/PublicKeyStore-support';
import { errorMessage, infoMessage, isStatusMessage, StatusMessage } from '../../types';
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
export type SendPrivateMessageArgs = {
  wrap: WrapFun;
  publicAddress: string;
  publicKey: string;
  receiver: string;
  subject: string;
  text: string;
  privateMessageStore: PrivateMessageStore;
  publicKeyStore: PublicKeyStore;
  replyIndex?: number;
};

export async function sendPrivateMessage({
  wrap,
  publicAddress,
  publicKey,
  receiver,
  subject,
  text,
  privateMessageStore,
  publicKeyStore,
  replyIndex
}: SendPrivateMessageArgs) {
  if (publicAddress && publicKey) {
    const res = await createInAndOutBox({
      wrap,
      subject,
      text,
      publicKey,
      publicKeyStore,
      privateMessageStore,
      receiver
    });
    if (isStatusMessage(res)) {
      return res;
    }
    const { inBox, outBox, contentHash } = res;
    return wrap('Store Message...', async () => {
      try {
        const res = await privateMessageStore.send(publicAddress, {
          address: receiver,
          subjectInBox: inBox.subjectEnc,
          textInBox: inBox.textEnc,
          subjectOutBox: outBox.subjectEnc,
          textOutBox: outBox.textEnc,
          contentHash,
          replyIndex
        });
        if (isStatusMessage(res)) {
          return res;
        }
        return infoMessage(`Message ${subject} successfully sent!`);
      } catch (e) {
        return resolveAsStatusMessage('Could not send message not successful!', e);
      }
    });
  } else {
    return errorMessage('Could not send message. Keys are missing!');
  }
}
