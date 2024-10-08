import { errorMessage, isStatusMessage, PublicKeyHolder, StatusMessage, warningMessage, Web3Session } from '../types';
import { NavigateFunction } from 'react-router-dom';
import { getContractRegistry, initContractRegistry } from '../contracts/contract-registry/ContractRegistry-support';
import { getAddressBook, initAddressBook } from '../contracts/address-book/AddressBook-support';
import { initUniqueNameStoreContract } from '../contracts/unique-name-store/UniqueNameStore-support';
import { loadPrivateMessageStore } from '../contracts/private-message-store/PrivateMessageStore-support';
import {
  getPublicKeyStore,
  initPublicKeyStore,
  PublicKeyStore
} from '../contracts/public-key-store/PublicKeyStore-support';
import { initKeyBlock } from '../contracts/key-block/KeyBlock-support';
import { loadDefaultPublicKeyStoreV2 } from '../contracts/public-key-store/PublicKeyStoreV2-support';
import { initArtworkTimeProof } from '../contracts/artwork-time-proof/ArtworkTimeProof-support';
import { getPublicKeyFromMetamask } from './login/connect-with-metamask';
import { AppContextData, SetAddressData } from './AppContextProvider';

export const reloadAddressData = async (setAddressData: SetAddressData): Promise<StatusMessage | undefined> => {
  const addressBook = getAddressBook();
  if (addressBook) {
    const addressData = await addressBook.getAddressBookAllData();
    if (isStatusMessage(addressData)) {
      return addressData;
    } else {
      setAddressData(addressData);
    }
  }
};

export async function retrievePublicKey(
  publicAddress: string,
  publicKeyStore?: PublicKeyStore
): Promise<PublicKeyHolder | StatusMessage> {
  const noPublicKeyStore = `No Public Key Store contract for: ${publicAddress}`;
  try {
    let publicKey: string | StatusMessage = '';
    if (publicKeyStore) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      publicKey = await publicKeyStore.get(publicAddress);
      if (isStatusMessage(publicKey)) {
        console.log(noPublicKeyStore);
        publicKey = '';
      }
      if (publicKey) {
        return { publicKey, origin: 'public-key-store' };
      }
    }
    if (!publicKey) {
      publicKey = await getPublicKeyFromMetamask(publicAddress);
    }
    if (publicKey) {
      return { publicKey, origin: 'wallet' };
    }
  } catch (e) {
    return errorMessage('getPublicKey64', e);
  }
  return warningMessage('Could not get Public Key');
}

export async function initDapps(
  web3Session: Web3Session,
  app: AppContextData,
  navigate: NavigateFunction
): Promise<void> {
  const { dispatchSnackbarMessage, setPublicKeyFromStore } = app;
  const { web3, networkId, publicAddress } = web3Session;

  const res = initContractRegistry(web3, networkId);
  dispatchSnackbarMessage(res);

  //
  // get public key from public key store
  //
  const publicKeyStore = getPublicKeyStore();
  let publicKeyFromStore = '';
  if (publicKeyStore) {
    const res = await publicKeyStore.get(publicAddress);
    if (isStatusMessage(res)) {
      dispatchSnackbarMessage(res);
    } else {
      publicKeyFromStore = res;
      setPublicKeyFromStore(publicKeyFromStore);
    }
  }

  const contractRegistry = getContractRegistry();

  if (!contractRegistry) {
    dispatchSnackbarMessage(errorMessage('Could not initialize ContractRegistry'));
    return;
  }

  // ADDRESS BOOK
  const r0 = await initAddressBook(contractRegistry, web3);
  dispatchSnackbarMessage(r0);
  const addressBookStatus = await reloadAddressData(app.setAddressData);
  if (addressBookStatus) {
    dispatchSnackbarMessage(addressBookStatus);
  }

  const r1 = await initUniqueNameStoreContract(contractRegistry, web3);
  if (isStatusMessage(r1)) {
    dispatchSnackbarMessage(r1);
  }

  const r2 = await loadPrivateMessageStore(web3);
  if (isStatusMessage(r2)) {
    dispatchSnackbarMessage(r2);
  }

  const r3 = await initPublicKeyStore(contractRegistry, web3);
  dispatchSnackbarMessage(r3);

  if (!web3Session.publicKeyHolder?.publicKey) {
    const publicKeyStore = getPublicKeyStore();
    const pkh = await retrievePublicKey(publicAddress, publicKeyStore);
    if (pkh) {
      if (isStatusMessage(pkh)) {
        dispatchSnackbarMessage(pkh);
      } else {
        web3Session.publicKeyHolder = pkh;
      }
    }
  }

  const r4 = await initKeyBlock(contractRegistry, web3);
  dispatchSnackbarMessage(r4);

  const r5 = await loadDefaultPublicKeyStoreV2(web3Session);
  if (isStatusMessage(r5)) {
    dispatchSnackbarMessage(r5);
  }

  const r6 = await initArtworkTimeProof(contractRegistry, web3, publicAddress);
  dispatchSnackbarMessage(r6);

  app.setWeb3Session({ ...web3Session });
  navigate('/menu');
}
