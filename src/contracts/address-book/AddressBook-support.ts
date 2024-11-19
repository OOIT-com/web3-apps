import Web3 from 'web3';

import { errorMessage, infoMessage, isStatusMessage, StatusMessage, successMessage } from '../../types';
import { resolveAsStatusMessage } from '../../utils/status-message-utils';
import { ContractRegistry } from '../contract-registry/ContractRegistry-support';
import { Contract } from 'web3-eth-contract';
import { getOwnableWithBackup, OwnableWithBackup } from '../ownable-with-backup/OwnableWithBackup-support';
import { addressBookAbi, addressBookBytecode } from './AddressBook-abi';
import { ContractName } from '../contract-utils';

export { addressBookAbi, addressBookBytecode };

type AddressBookAbiType = typeof addressBookAbi;
type AddressBookContractType = Contract<AddressBookAbiType>;

export type AddressData = {
  userAddress: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  name1: string;
  name2: string;
  name3: string;
  status: string;
  created: number;
  updated: number;
};

export type AddressDataWithIndex = AddressData & {
  index?: number;
};

export async function initAddressBook(contractRegistry: ContractRegistry, web3: Web3): Promise<StatusMessage> {
  const addressBookEntry = await contractRegistry.getByName(ContractName.ADDRESS_BOOK);
  if (isStatusMessage(addressBookEntry)) {
    return addressBookEntry;
  }
  const contractAddress = addressBookEntry.contractAddress.toLowerCase();

  if (!contractAddress) {
    return errorMessage(`Contract address for ${ContractName.ADDRESS_BOOK} missing!`);
  }
  const contract = new web3.eth.Contract(addressBookAbi, contractAddress);
  instance = new AddressBook(contract, getOwnableWithBackup(web3, contractAddress));
  return successMessage(`Contract ${ContractName.ADDRESS_BOOK} successfully initialized!`);
}

let instance: AddressBook | undefined;

export const getAddressBook = () => instance;

export class AddressBook {
  private readonly contract: AddressBookContractType;
  private readonly owb: OwnableWithBackup;

  constructor(contract: AddressBookContractType, owb: OwnableWithBackup) {
    this.contract = contract;
    this.owb = owb;
  }

  public async owner() {
    return this.owb.owner();
  }

  public getAddressBookContract = () => this.contract;

  public async add(contractData: AddressData, from: string): Promise<StatusMessage> {
    const tag = '<Add>';
    try {
      await this.contract.methods.add(contractData).call({
        from
      });

      const { transactionHash } = await this.contract.methods.add(contractData).send({
        from
      });
      return successMessage(`${tag} Transaction receipt: ${transactionHash}`);
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async update(contractData: AddressData, from: string): Promise<StatusMessage> {
    const tag = '<Update>';
    try {
      await this.contract.methods.update(contractData).call({
        from
      });
      const { transactionHash } = await this.contract.methods.update(contractData).send({
        from
      });
      return successMessage(`${tag} Transaction receipt: ${transactionHash}`);
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async remove(userAddress: string, from: string): Promise<string | StatusMessage> {
    const tag = '<Unregister>';
    try {
      const { transactionHash } = await this.contract.methods.remove(userAddress).send({
        from
      });
      return infoMessage(`${tag} Transaction receipt: ${transactionHash}`);
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async getByAddress(contractAddress: string): Promise<AddressData | StatusMessage> {
    const tag = '<GetByAddress>';
    try {
      return await this.contract.methods.getByAddress(contractAddress).call();
    } catch (e) {
      console.error(e);
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async getByName(name: string): Promise<AddressData | StatusMessage> {
    const tag = '<GetByName>';
    try {
      return await this.contract.methods.getByName(name).call();
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async getAddressDataCount(): Promise<number | StatusMessage> {
    const tag = '<GetAddressDataCount>';
    try {
      return +(await this.contract.methods.getAddressDataCount().call()).toString();
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async getAddressData(index: number): Promise<AddressDataWithIndex | StatusMessage> {
    const tag = '<GetAddressData>';
    try {
      const o: AddressDataWithIndex = await this.contract.methods.getAddressData(index).call();
      return { ...o, index };
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async getAddressBookAllData(): Promise<AddressData[] | StatusMessage> {
    const list: AddressDataWithIndex[] = [];
    const count = await this.getAddressDataCount();
    if (isStatusMessage(count)) {
      return count;
    }
    for (let index = 0; index < count; index++) {
      const data = await this.getAddressData(index);
      if (isStatusMessage(data)) {
        return data;
      }
      list.push({ ...data, userAddress: data.userAddress.toLowerCase() });
    }

    return list;
  }
}

//
//
export const newAddressDataTemplate = (name: string): AddressDataWithIndex => ({
  name,
  userAddress: '',
  description: '',
  email: '',
  phone: '',
  name1: '',
  name2: '',
  name3: '',
  status: 'active',
  created: 0,
  updated: 0
});
