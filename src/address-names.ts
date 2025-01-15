import { AddressData, getAddressBook, newAddressDataTemplate } from './contracts/address-book/AddressBook-support';
import { isStatusMessage, StatusMessage, warningMessage } from './types';
import { ContractData, getContractRegistry } from './contracts/contract-registry/ContractRegistry-support';
import { getUniqueNameStore } from './contracts/unique-name-store/UniqueNameStore-support';

import { ContractName } from './contracts/contract-utils';

export const eoaResolved: Record<string, string> = {};
export const addressesResolved: Record<string, AddressData | ContractData> = {};

export async function resolveAddress(addr: string): Promise<string | StatusMessage> {
  if (addressesResolved[addr]) {
    return addressesResolved[addr].name;
  }

  const addressBook = getAddressBook();
  if (addressBook) {
    const a = await addressBook.getByAddress(addr);
    if (!isStatusMessage(a)) {
      addressesResolved[addr.toLowerCase()] = a;
      return a.name;
    }
  }

  const uniqueNameStore = getUniqueNameStore();
  if (uniqueNameStore && addressBook) {
    const res0 = await uniqueNameStore.getName(addr);
    if (!res0 && !isStatusMessage(res0)) {
      addressesResolved[addr] = { ...newAddressDataTemplate(res0), userAddress: addr };
      return res0;
    }

    let res: StatusMessage | AddressData | ContractData = await addressBook.getByAddress(addr.toLowerCase());
    if (isStatusMessage(res)) {
      return res;
    } else if (res.name) {
      addressesResolved[addr] = res;
      eoaResolved[addr] = res.name;
      return res.name;
    }
    const contractRegistry = getContractRegistry();
    if (!contractRegistry) {
      return warningMessage('ContractRegistry found!');
    }
    res = await contractRegistry.getByAddress(addr);
    if (isStatusMessage(res)) {
      return res;
    } else if (res.name) {
      addressesResolved[addr] = res;
      return res.name;
    }
    return warningMessage('No user or contract name found!');
  } else {
    return warningMessage(`${ContractName.UNIQUE_NAME_STORE} not initialized!`);
  }
}
