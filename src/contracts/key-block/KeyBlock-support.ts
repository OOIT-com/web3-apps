import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { errorMessage, isStatusMessage, StatusMessage, successMessage } from '../../types';
import moment from 'moment';

import { ContractRegistry } from '../contract-registry/ContractRegistry-support';
import { keyBlockAbi } from './KeyBlock-abi';
import { ContractName } from '../contract-utils';
import { resolveAsStatusMessage } from '../../utils/status-message-utils';

type KeyBlockAbiType = typeof keyBlockAbi;
type KeyBlockContractType = Contract<KeyBlockAbiType>;

export async function initKeyBlock(contractRegistry: ContractRegistry, web3: Web3): Promise<StatusMessage> {
  const res = await contractRegistry.getByName(ContractName.KEY_BLOCK);
  if (isStatusMessage(res)) {
    return res;
  }
  const contractAddress = res.contractAddress.toLowerCase();

  if (!contractAddress) {
    return errorMessage(`Contract address for ${ContractName.KEY_BLOCK} missing!`);
  }
  const contract = new web3.eth.Contract(keyBlockAbi, contractAddress, web3);
  instance = new KeyBlock(contract);
  return successMessage(`Contract ${ContractName.KEY_BLOCK} successfully initialized!`);
}

let instance: KeyBlock | undefined;
export const getKeyBlock = () => instance;

export class KeyBlock {
  private readonly contract: KeyBlockContractType;

  constructor(contract: KeyBlockContractType) {
    this.contract = contract;
  }

  public getContract = (): KeyBlockContractType => this.contract;

  public async len(from: string): Promise<number | StatusMessage> {
    try {
      const res = await this.contract.methods.len().call({ from });
      return +res.toString();
    } catch (e) {
      console.error('KeyBlock-len failed', e);
      return resolveAsStatusMessage('Could not call KeyBlock_len', e);
    }
  }

  public async get(from: string, index: number): Promise<string[] | StatusMessage> {
    try {
      return await this.contract.methods.get(index).call({ from });
    } catch (e) {
      console.error('KeyBlock_get failed', e);
      return resolveAsStatusMessage('Could not get entry', e);
    }
  }

  public async add(from: string, name: string, secretContent: string): Promise<string | StatusMessage> {
    const inserted = moment().format('YYYY-MM-DD HH:mm');
    try {
      await this.contract.methods.add(name, secretContent, inserted).send({ from });
      return 'ok';
    } catch (e) {
      console.error('KeyBlock_add failed', e);
      return resolveAsStatusMessage('Could not add KeyBlock entry', e);
    }
  }

  public async set(from: string, index: number, name: string, secretContent: string): Promise<string | StatusMessage> {
    const inserted = moment().format('YYYY-MM-DD HH:mm');
    try {
      await this.contract.methods.set(index, name, secretContent, inserted).send({ from });
      return 'ok';
    } catch (e) {
      console.error('KeyBlock_set failed', e);
      return resolveAsStatusMessage('Could not call save Entry', e);
    }
  }
}

export type SecretVaultEntry = { index: number; name: string; secret: string; inserted: string };
export const EmptyItem: SecretVaultEntry = { index: -1, name: '', secret: '', inserted: '' };
