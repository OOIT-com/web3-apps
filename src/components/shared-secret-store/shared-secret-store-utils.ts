import { WrapFun } from '../AppContextProvider';
import { PublicKeyStore } from '../../contracts/public-key-store/PublicKeyStore-support';
import { errorMessage, isStatusMessage, StatusMessage } from '../../utils/status-message';
import { displayAddress } from '../../utils/misc-util';
import { encryptEthCryptoBinary } from '../../utils/eth-crypto-utils';

export async function encryptForUser(
  wrap: WrapFun,
  userAddress: string,
  secret: Uint8Array,
  publicKeyStore: PublicKeyStore
): Promise<StatusMessage | Uint8Array> {
  const publicKey = await wrap(
    `Reading Public Key for user address ${displayAddress(userAddress)} from PublicKeyStore...`,
    () => publicKeyStore.get(userAddress)
  );

  if (!publicKey || publicKey === '0x') {
    return errorMessage(`No public key found for user address: ${displayAddress(userAddress)}`);
  }

  if (isStatusMessage(publicKey)) {
    return publicKey;
  }
  if (!publicKey) {
    return errorMessage(
      `For the address ${displayAddress(
        userAddress
      )} no Public Key is stored on this Blockchain! Please inform the user of ${displayAddress(
        userAddress
      )} to publish the Public Key to the Public Key Store!`
    );
  }
  const res = await encryptEthCryptoBinary(publicKey, secret);
  if (!res) {
    return errorMessage('Error occurred in: encryptEthCryptoBinary');
  }
  return res;
}
