import { Contract } from 'web3-eth-contract';
import { errorMessage, isStatusMessage, StatusMessage, Web3Session } from '../../types';
import { publicKeyStoreV2Abi } from './PublicKeyStoreV2-abi';
import { resolveAsStatusMessage } from '../../utils/status-message-utils';
import { getContractRegistry } from '../contract-registry/ContractRegistry-support';

import { ContractName } from '../contract-utils';
import { newBoxKeyPair } from '../../utils/nacl-util';
import { encryptBuffer } from '../../utils/metamask-util';
import { Buffer } from 'buffer';

type PublicKeyStoreV2AbiType = typeof publicKeyStoreV2Abi;
type PublicKeyStoreV2ContractType = Contract<PublicKeyStoreV2AbiType>;

export async function loadDefaultPublicKeyStoreV2(web3Session: Web3Session): Promise<StatusMessage | PublicKeyStoreV2> {
  const contractRegistry = getContractRegistry();
  if (!contractRegistry) {
    return errorMessage(`Contract Registry not available!`);
  }
  if (instance) {
    return instance;
  }
  const res = await contractRegistry.getByName(ContractName.PUBLIC_KEY_STORE_V2);
  if (isStatusMessage(res)) {
    return res;
  }
  const contractAddress = res.contractAddress.toLowerCase();

  if (!contractAddress) {
    return errorMessage(`Contract address for ${ContractName.PUBLIC_KEY_STORE_V2} missing!`);
  }
  instance = newPublicKeyStoreV2(web3Session, contractAddress);
  return instance;
}

export function newPublicKeyStoreV2(web3Session: Web3Session, contractAddress: string): PublicKeyStoreV2 {
  return new PublicKeyStoreV2(web3Session, contractAddress);
}

let instance: PublicKeyStoreV2 | undefined;

export class PublicKeyStoreV2 {
  private readonly contract: PublicKeyStoreV2ContractType;
  private readonly web3Session: Web3Session;
  public secretKey: Uint8Array | undefined = undefined;

  constructor(web3Session: Web3Session, contractAddress: string) {
    this.web3Session = web3Session;
    const { web3 } = web3Session;
    this.contract = new web3.eth.Contract(publicKeyStoreV2Abi, contractAddress, web3);
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

  public async initMyKeys(): Promise<{ secretKey: Uint8Array; publicKey: Uint8Array } | StatusMessage> {
    const pk = this.web3Session.publicKeyHolder?.publicKey;
    if (!pk) {
      return errorMessage('No Public Key available!');
    }
    const { publicKey, secretKey } = newBoxKeyPair();
    this.secretKey = secretKey;
    const encSecretKey = encryptBuffer(pk, Buffer.from(secretKey));
    const encSecretKey64 = encSecretKey.toString('base64');
    const publicKey64 = Buffer.from(publicKey).toString('base64');

    const res = await this.setKeys({ publicKey: publicKey64, encSecretKey: encSecretKey64 });
    if (isStatusMessage(res)) {
      return res;
    }
    return { secretKey, publicKey };
  }

  public async setKeys({
    publicKey,
    encSecretKey
  }: {
    publicKey: string;
    encSecretKey: string;
  }): Promise<string | StatusMessage> {
    const from = this.web3Session.publicAddress;
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
