import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { errorMessage, isStatusMessage, StatusMessage, successMessage } from '../../types';
import { publicKeyStoreV2Abi } from './PublicKeyStoreV2-abi';
import { resolveAsStatusMessage } from '../../utils/status-message-utils';
import { ContractRegistry } from '../contract-registry/ContractRegistry-support';

import { ContractName } from '../contract-utils';

type PublicKeyStoreV2AbiType = typeof publicKeyStoreV2Abi;
type PublicKeyStoreV2ContractType = Contract<PublicKeyStoreV2AbiType>;

export async function initPublicKeyStoreV2(contractRegistry: ContractRegistry, web3: Web3): Promise<StatusMessage> {
  const res = await contractRegistry.getByName(ContractName.PUBLIC_KEY_STORE_V2);
  if (isStatusMessage(res)) {
    return res;
  }
  const contractAddress = res.contractAddress.toLowerCase();

  if (!contractAddress) {
    return errorMessage(`Contract address for ${ContractName.PUBLIC_KEY_STORE_V2} missing!`);
  }
  const contract = new web3.eth.Contract(publicKeyStoreV2Abi, contractAddress, web3);
  instance = new PublicKeyStoreV2(contract);
  return successMessage(`Contract ${ContractName.PUBLIC_KEY_STORE_V2} successfully initialized!`);
}

let instance: PublicKeyStoreV2 | undefined;
export const getPublicKeyStoreV2 = () => instance;

export class PublicKeyStoreV2 {
  private readonly contract: PublicKeyStoreV2ContractType;

  constructor(contract: PublicKeyStoreV2ContractType) {
    this.contract = contract;
  }

  public async getEncSecretKey(from: string): Promise<string | StatusMessage> {
    const tag = '<GetEncSecretKey>';
    try {
      return await this.contract.methods.getEncSecretKey().call({ from });
    } catch (e) {
      return resolveAsStatusMessage(`${tag} failed`, e);
    }
  }

  public async getPublicKey(address: string): Promise<string | StatusMessage> {
    const tag = '<GetPublicKey>';
    try {
      return await this.contract.methods.getPublicKey(address).call();
    } catch (e) {
      return resolveAsStatusMessage(tag, e);
    }
  }

  public async setKeys({
    from,
    publicKey,
    encSecretKey
  }: {
    from: string;
    publicKey: string;
    encSecretKey: string;
  }): Promise<string | StatusMessage> {
    const tag = '<SetKeys>';
    try {
      const keys = await this.getPublicKey(from);
      if (typeof keys === 'string' && keys) {
        return errorMessage(`Keys are already saved for ${from}!`);
      }
      await this.contract.methods.setKeys(publicKey, encSecretKey).send({ from });
      return publicKey;
    } catch (e) {
      return resolveAsStatusMessage(tag, e);
    }
  }
}
