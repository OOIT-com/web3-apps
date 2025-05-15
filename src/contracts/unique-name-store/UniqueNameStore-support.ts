import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { uniqueNameStoreAbi } from './UniqueNameStore-abi';
import { ContractRegistry } from '../contract-registry/ContractRegistry-support';
import { ContractName } from '../contract-utils';
import {errorMessage, isStatusMessage, StatusMessage} from "../../utils/status-message";

type UniqueNameStoreAbiType = typeof uniqueNameStoreAbi;
type UniqueNameStoreContractType = Contract<UniqueNameStoreAbiType>;

export async function initUniqueNameStoreContract(
  contractRegistry: ContractRegistry,
  web3: Web3
): Promise<UniqueNameStore | StatusMessage> {
  const uniqueNameStore = await contractRegistry.getByName(ContractName.UNIQUE_NAME_STORE);
  if (isStatusMessage(uniqueNameStore)) {
    return uniqueNameStore;
  }
  const contractAddress = uniqueNameStore.contractAddress.toLowerCase();

  if (!contractAddress) {
    return errorMessage(`Contract address for ${ContractName.UNIQUE_NAME_STORE} missing!`);
  }
  const contract = new web3.eth.Contract(uniqueNameStoreAbi, contractAddress);
  instance = new UniqueNameStore(contract);
  return instance;
}

let instance: UniqueNameStore | undefined;
export const getUniqueNameStore = () => instance;

export class UniqueNameStore {
  private readonly contract: UniqueNameStoreContractType;

  constructor(contract: UniqueNameStoreContractType) {
    this.contract = contract;
  }

  public async getName(address: string): Promise<string | StatusMessage> {
    try {
      return await this.contract.methods.addressToNameMap(address).call();
    } catch (e) {
      console.error('UniqueNameStore_getByAddress failed', e);
      return errorMessage('Could not call ', e);
    }
  }

  public async getAddress(name: string, from: string): Promise<string | StatusMessage> {
    try {
      return await this.contract.methods.nameToAddressMap(name).call({ from });
    } catch (e) {
      console.error('UniqueNameStore_getByAddress failed', e);
      return errorMessage('Could not call UniqueNameStore_getByAddress', e);
    }
  }

  public async setName(name: string, from: string): Promise<string | StatusMessage> {
    try {
      await this.contract.methods.setName(name).send({ from });
      return 'ok';
    } catch (e) {
      console.error('UniqueNameStore_setName failed', e);
      return errorMessage('Could not call UniqueNameStore_setName', e);
    }
  }

  public async unSetName(from: string): Promise<string | StatusMessage> {
    try {
      await this.contract.methods.unSetName().send({ from });
      return 'ok';
    } catch (e) {
      console.error('UniqueNameStore_unSetName failed', e);
      return errorMessage('Could not call UniqueNameStore_unSetName', e);
    }
  }
}
