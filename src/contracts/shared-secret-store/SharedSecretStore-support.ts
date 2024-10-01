import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { errorMessage, infoMessage, isStatusMessage, StatusMessage } from '../../types';

import { sharedSecretStoreAbi, sharedSecretStoreBytecode } from './SharedSecretStore-abi';
import { resolveAsStatusMessage } from '../../utils/status-message-utils';
import nacl from 'tweetnacl';
import { Buffer } from 'buffer';
import { decryptBuffer, encryptBuffer } from '../../utils/metamask-util';
import { deployContract } from '../deploy-contract';
import { newEncSecretByPublicKey } from '../../utils/enc-dec-utils';

type SharedSecretStoreAbiType = typeof sharedSecretStoreAbi;
type SharedSecretStoreContractType = Contract<SharedSecretStoreAbiType>;

export class SharedSecretStore {
  private readonly web3: Web3;
  private readonly contractAddress: string;
  private readonly contract: SharedSecretStoreContractType;

  constructor(web3: Web3, contractAddress: string) {
    this.web3 = web3;
    this.contractAddress = contractAddress;
    this.contract = new web3.eth.Contract(sharedSecretStoreAbi, this.contractAddress, web3);
  }

  async getUserCount(from: string): Promise<number | StatusMessage> {
    const tag = '<UserCount>';
    try {
      const res = await this.contract.methods.getUserCount().call({ from });
      return +res.toString();
    } catch (e) {
      return resolveAsStatusMessage(tag, e);
    }
  }

  async getUser(index: number, from: string): Promise<string | StatusMessage> {
    const tag = '<GetUser>';
    try {
      const res = await this.contract.methods.getUser(index).call({ from });
      return res.toString().toLowerCase();
    } catch (e) {
      return resolveAsStatusMessage(tag, e);
    }
  }

  async owner(from: string): Promise<string | StatusMessage> {
    const tag = '<Owner>';
    try {
      const res = await this.contract.methods.owner().call({ from });
      return res.toString().toLowerCase();
    } catch (e) {
      return resolveAsStatusMessage(tag, e);
    }
  }

  async setEncryptedSecret(user: string, encryptedSecret: string, from: string): Promise<StatusMessage> {
    const tag = '<SetEncryptedSecret>';
    try {
      const { transactionHash } = await this.contract.methods.setEncryptedSecret(user, encryptedSecret).send({ from });
      return infoMessage(`Transaction receipt of ${tag} ${user} of ${encryptedSecret}: ${transactionHash}`);
    } catch (e) {
      return resolveAsStatusMessage(tag, e);
    }
  }

  async getUserEncryptedSecret(user: string, from: string): Promise<string | StatusMessage> {
    const tag = '<SetEncryptedSecret>';
    try {
      const es = await this.contract.methods.getUserEncryptedSecret(user).call({ from });
      return es.toString();
    } catch (e) {
      return resolveAsStatusMessage(tag, e);
    }
  }

  async removeEncryptedSecret(user: string, from: string): Promise<StatusMessage> {
    const tag = '<RemoveEncryptedSecret>';
    try {
      const { transactionHash } = await this.contract.methods.removeEncryptedSecret(user).send({ from });
      return infoMessage(`Transaction receipt of ${tag} for ${user}: ${transactionHash}`);
    } catch (e) {
      return resolveAsStatusMessage(tag, e);
    }
  }
}

export async function deployShareSecretStoreContract(
  web3: Web3,
  publicKey: string,
  from: string
): Promise<
  | StatusMessage
  | {
      contractAddress: string;
      encryptedSecret: string;
    }
> {
  const tag = '<DeployShareSecretStoreContract>';
  try {
    const encryptedSecret = newEncSecretByPublicKey(publicKey);

    const contractAddress = await deployContract({
      web3,
      contractABI: JSON.stringify(sharedSecretStoreAbi),
      contractBytecode: sharedSecretStoreBytecode,
      from,
      constructorArgs: [encryptedSecret]
    });
    if (isStatusMessage(contractAddress)) {
      return contractAddress;
    }
    return { contractAddress, encryptedSecret };
  } catch (e) {
    return resolveAsStatusMessage(tag, e);
  }
}

export async function encryptionTest({
  publicKey,
  publicAddress
}: {
  publicKey: string;
  publicAddress: string;
}): Promise<StatusMessage> {
  const tag = '<Encryption Test>';
  try {
    const keyPair = nacl.box.keyPair();

    const secretKeyBuffer1 = new Buffer(keyPair.secretKey);
    const s1 = Buffer.from(secretKeyBuffer1).toString('base64');

    const buf = encryptBuffer(publicKey, secretKeyBuffer1); //buffer.toString(base64)
    const encryptedSecret = buf.toString('base64');

    const secretKeyBuffer2 = await decryptBuffer(publicAddress, Buffer.from(encryptedSecret, 'base64')); // buffer.toString()

    const s2 = secretKeyBuffer2.toString('base64');

    if (s1 === s2) {
      return infoMessage(`${tag} successfull!`);
    }
    return errorMessage('Encryption Test: Error on encryption/decryption!');
  } catch (e) {
    return resolveAsStatusMessage(tag, e);
  }
}
