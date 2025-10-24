import Web3 from 'web3';

import { contractRegistryAbi } from './ContractRegistry-abi';
import { resolveAsStatusMessage } from '../../utils/status-message-utils';
import { Contract } from 'web3-eth-contract';
import { ContractName, getContractAddress } from '../contract-utils';
import { errorMessage, infoMessage, isStatusMessage, StatusMessage, successMessage } from '../../utils/status-message';

type ContractRegistryAbiType = typeof contractRegistryAbi;
type ContractRegistryContractType = Contract<ContractRegistryAbiType>;

export let contractAddress = '';

export const newContractDataTemplate = (name: string, contractAddress: string): ContractDataWithIndex => ({
  name,
  contractAddress,
  description: '',
  constructorArgs: '',
  url: '',
  sourceCodeUrl: '',
  contractName: '',
  contractType: '',
  status: 'active',
  created: 0,
  updated: 0
});

export type ContractData = {
  contractAddress: string;
  name: string;
  description: string;
  constructorArgs: string;

  url: string;
  sourceCodeUrl: string;
  contractName: string;
  contractType: string;

  status: string;
  created: number;
  updated: number;
};

export type ContractDataWithIndex = ContractData & {
  index?: number;
};

export const getContractRegistryContractAddress = () => contractAddress;

export function initContractRegistry(web3: Web3, chainId: number): StatusMessage {
  contractAddress = getContractAddress(chainId, ContractName.CONTRACT_REGISTRY);
  const contract = new web3.eth.Contract(contractRegistryAbi as any, contractAddress);
  instance = new ContractRegistry(contract, contractAddress);
  return successMessage(`Contract ${ContractName.CONTRACT_REGISTRY} successfully initialized!`);
}

let instance: ContractRegistry | undefined;
export const getContractRegistry = () => instance;

export class ContractRegistry {
  private readonly contract: ContractRegistryContractType;
  public readonly contractAddress: string;

  constructor(contract: ContractRegistryContractType, contractAddress: string) {
    this.contract = contract;
    this.contractAddress = contractAddress;
  }

  public async register(contractData: ContractData, from: string): Promise<StatusMessage> {
    const tag = '<Register>';
    try {
      await this.contract.methods.register(contractData).call({
        from
      });

      const { transactionHash } = await this.contract.methods.register(contractData).send({
        from
      });
      return successMessage(`${tag} Transaction receipt: ${transactionHash}`);
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async update(contractData: ContractData, from: string): Promise<StatusMessage> {
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

  public async unregister(contractAddress: string, from: string): Promise<string | StatusMessage> {
    const tag = '<Unregister>';
    try {
      const { transactionHash } = await this.contract.methods.unregister(contractAddress).send({
        from
      });
      return infoMessage(`${tag} Transaction receipt: ${transactionHash}`);
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async setStatus(contractAddress: string, status: string, from: string): Promise<StatusMessage> {
    const tag = '<SetStatus>';
    try {
      const { transactionHash } = await this.contract.methods.setStatus(contractAddress, status).send({
        from
      });
      return infoMessage(`${tag} Transaction receipt: ${transactionHash}`);
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async getContractDataCount(): Promise<number | StatusMessage> {
    const tag = '<GetContractDataCount>';
    try {
      return +(await this.contract.methods.getContractDataCount().call()).toString();
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async getContractData(index: number): Promise<ContractDataWithIndex | StatusMessage> {
    const tag = '<GetContractData>';
    try {
      const o = await this.contract.methods.getContractData(index).call();
      const o1 = o as ContractData;
      return { ...o1, index };
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async getByAddress(contractAddress: string): Promise<ContractData | StatusMessage> {
    const tag = '<GetByAddress>';
    try {
      return await this.contract.methods.getByAddress(contractAddress).call();
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async getByName(name: string): Promise<ContractData | StatusMessage> {
    const tag = '<GetByName>';
    try {
      const res = await this.contract.methods.getByName(name).call();
      if (res.name === '') {
        return errorMessage(`No contract data found for ${name}`);
      }
      return res as ContractData;
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async getContractRegistryAllData(): Promise<ContractData[] | StatusMessage> {
    const list: ContractDataWithIndex[] = [];
    const count = await this.getContractDataCount();
    if (isStatusMessage(count)) {
      return count;
    }
    for (let index = 0; index < count; index++) {
      const data = await this.getContractData(index);
      if (isStatusMessage(data)) {
        return data;
      }
      list.push(data);
    }

    return list;
  }

  public async getAllNames(): Promise<string[] | StatusMessage> {
    const list = await this.getContractRegistryAllData();
    if (isStatusMessage(list)) {
      return list;
    }
    return list.map(({ name }) => name);
  }

  public async transferOwnership(newOwnerAddress: string, from: string): Promise<StatusMessage> {
    const tag = '<TransferOwnership>';
    try {
      const { transactionHash } = await this.contract.methods.transferOwnership(newOwnerAddress).send({
        from
      });
      return successMessage(`${tag} Transaction receipt: ${transactionHash}`);
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async getOwner() {
    const tag = '<getOwner>';
    try {
      const addr = await this.contract.methods.owner().call();
      return addr.toLowerCase();
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }
}
