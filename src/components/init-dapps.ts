import { Web3Session } from '../types';
import { NavigateFunction } from 'react-router-dom';
import { getContractRegistry, initContractRegistry } from '../contracts/contract-registry/ContractRegistry-support';
import { getAddressBook, initAddressBook } from '../contracts/address-book/AddressBook-support';
import { initUniqueNameStoreContract } from '../contracts/unique-name-store/UniqueNameStore-support';
import { initPublicKeyStore } from '../contracts/public-key-store/PublicKeyStore-support';
import { initKeyBlock } from '../contracts/key-block/KeyBlock-support';
import { loadDefaultPublicKeyStoreV2 } from '../contracts/public-key-store/PublicKeyStoreV2-support';
import { initArtworkTimeProof } from '../contracts/artwork-time-proof/ArtworkTimeProof-support';
import { AppContextData, SetAddressData } from './AppContextProvider';
import { errorMessage, isStatusMessage, StatusMessage } from '../utils/status-message';

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

export async function initDapps(
  web3Session: Web3Session,
  app: AppContextData,
  navigate: NavigateFunction
): Promise<void> {
  const { dispatchSnackbarMessage } = app;
  const { web3, chainId, publicAddress } = web3Session;

  const res = initContractRegistry(web3, chainId);
  dispatchSnackbarMessage(res);

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

  const r3 = await initPublicKeyStore(contractRegistry, web3);
  dispatchSnackbarMessage(r3);

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
