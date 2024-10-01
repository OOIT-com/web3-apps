import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { errorMessage, isStatusMessage, StatusMessage, successMessage } from '../../types';
import { publicKeyStoreAbi } from './PublicKeyStore-abi';
import { resolveAsStatusMessage } from '../../utils/status-message-utils';
import { ContractRegistry } from '../contract-registry/ContractRegistry-support';
import { ContractName } from '../contract-utils';

type PublicKeyStoreAbiType = typeof publicKeyStoreAbi;
type PublicKeyStoreContractType = Contract<PublicKeyStoreAbiType>;

export async function initPublicKeyStore(contractRegistry: ContractRegistry, web3: Web3): Promise<StatusMessage> {
  const res = await contractRegistry.getByName(ContractName.PUBLIC_KEY_STORE);
  if (isStatusMessage(res)) {
    return res;
  }

  const contractAddress = res.contractAddress;

  if (!contractAddress) {
    return errorMessage(`No contract found on for ${ContractName.PUBLIC_KEY_STORE}`);
  }
  const contract = new Contract(publicKeyStoreAbi, contractAddress, web3);
  instance = new PublicKeyStore(contract);
  return successMessage(`Successfully initialized ${ContractName.PUBLIC_KEY_STORE}`);
}

let instance: PublicKeyStore | undefined;
export const getPublicKeyStore = () => instance;

export class PublicKeyStore {
  private readonly contract: PublicKeyStoreContractType;

  constructor(contract: PublicKeyStoreContractType) {
    this.contract = contract;
  }

  public async get(address: string): Promise<string | StatusMessage> {
    const tag = '<GetPublicKey>';
    try {
      const res = await this.contract.methods.get(address).call();
      return res.toString();
    } catch (e) {
      return resolveAsStatusMessage(tag, e);
    }
  }

  public async set({ publicKey, from }: { publicKey: string; from: string }): Promise<string | StatusMessage> {
    const tag = '<SetPublicKey>';
    try {
      await this.contract.methods.set(publicKey).send({ from });
      return this.get(from);
    } catch (e) {
      return resolveAsStatusMessage(tag, e);
    }
  }
}
