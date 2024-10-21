import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { errorMessage, isStatusMessage, StatusMessage, Web3Session } from '../../types';

import { privateMessageStoreV2Abi, privateMessageStoreV2Bytecode } from './PrivateMessageStoreV2-abi';
import { getContractRegistry } from '../contract-registry/ContractRegistry-support';
import { ContractName } from '../contract-utils';
import { resolveAsStatusMessage } from '../../utils/status-message-utils';
import { decryptContentFromSender, encryptContentForReceiver } from '../../utils/nacl-util';
import { newPublicKeyStoreV2, PublicKeyStoreV2 } from '../public-key-store/PublicKeyStoreV2-support';
import { Buffer } from 'buffer';
import { displayAddress } from '../../utils/misc-util';
import { deployContract } from '../deploy-contract';
import { publicKeyStoreV2Abi, publicKeyStoreV2bytecode } from '../public-key-store/PublicKeyStoreV2-abi';
import { DeploymentFunction } from '../types';

type PrivateMessageStoreV2AbiType = typeof privateMessageStoreV2Abi;
type PrivateMessageStoreV2Type = Contract<PrivateMessageStoreV2AbiType>;

type SendArgs = {
  address: string;
  subjectInBox: string;
  textInBox: string;
  subjectOutBox: string;
  textOutBox: string;
  contentHash: string;
  replyIndex?: number;
};

export type GetInBoxResult = {
  sender: string;
  indexOutBox: number;
  subjectInBox: string;
  textInBox: string;
  inserted: number;
  confirmedTime: number;
  confirmed: boolean;
  hasReply: boolean;
  replyIndex: number;
  contentHash: string;
  index: number;
};

export type GetOutBoxResult = {
  receiver: string;
  indexInBox: number;
  subjectOutBox: string;
  textOutBox: string;
  contentHash: string;
  inserted: number;
  confirmedTime: number;
  confirmed: boolean;
  hasReply: boolean;
  replyIndex: number;
  index: number;
};

export const loadPrivateMessageStoreV2 = async (
  web3session: Web3Session
): Promise<StatusMessage | PrivateMessageStoreV2> => {
  if (instance) {
    return instance;
  }

  const contractRegistry = getContractRegistry();
  if (!contractRegistry) {
    return errorMessage('No Contract Registry available!');
  }

  const res = await contractRegistry.getByName(ContractName.PRIVATE_MESSAGE_STORE_V2);
  if (isStatusMessage(res)) {
    return res;
  }

  const contractAddress = res.contractAddress;
  if (!contractAddress) {
    return errorMessage(`No contract found for ${ContractName.PRIVATE_MESSAGE_STORE_V2}`);
  }

  instance = new PrivateMessageStoreV2(contractAddress, web3session);
  console.log(`Successfully initialized ${ContractName.PRIVATE_MESSAGE_STORE_V2} with address ${contractAddress}`);
  return instance;
};

let instance: PrivateMessageStoreV2 | undefined;

export class PrivateMessageStoreV2 {
  private readonly contract: PrivateMessageStoreV2Type;
  private publicKeyStore: PublicKeyStoreV2 | undefined;
  private publicKeyCache: Record<string, Uint8Array> = {};
  public readonly web3Session: Web3Session;

  constructor(contractAddress: string, web3Session: Web3Session) {
    this.contract = new web3Session.web3.eth.Contract(privateMessageStoreV2Abi, contractAddress, web3Session.web3);
    this.web3Session = web3Session;
  }

  public async getPublicKeyStore(): Promise<PublicKeyStoreV2> {
    if (!this.publicKeyStore) {
      const contractAddress: string = await this.contract.methods.getPublicKeyStoreV2Address().call();
      this.publicKeyStore = newPublicKeyStoreV2(this.web3Session, contractAddress);
    }
    return this.publicKeyStore;
  }

  public async sendMessage(
    subject: string,
    text: string,
    receiver: string,
    replyIndex?: number
  ): Promise<StatusMessage | void> {
    const contentHash = Web3.utils.keccak256(text);
    const textInBox = await this.encryptContent(text, receiver);
    const textOutBox = await this.encryptContent(text, this.web3Session.publicAddress);

    if (isStatusMessage(textInBox)) {
      return textInBox;
    }
    if (isStatusMessage(textOutBox)) {
      return textOutBox;
    }

    return this.send(this.web3Session.publicAddress, {
      address: receiver,
      subjectInBox: subject,
      textInBox,
      subjectOutBox: subject,
      textOutBox,
      contentHash,
      replyIndex
    });
  }

  public async replyMessage(
    subject: string,
    text: string,
    receiver: string,
    replyIndex: number
  ): Promise<StatusMessage | void> {
    return this.sendMessage(subject, text, receiver, replyIndex);
  }

  public async send(
    from: string,
    { replyIndex, address, subjectInBox, textInBox, subjectOutBox, textOutBox, contentHash }: SendArgs
  ): Promise<void | StatusMessage> {
    try {
      let tx;
      if (typeof replyIndex === 'number') {
        tx = await this.contract.methods
          .reply(address, subjectInBox, textInBox, subjectOutBox, textOutBox, contentHash, replyIndex)
          .send({ from });
      } else {
        tx = await this.contract.methods
          .send(address, subjectInBox, textInBox, subjectOutBox, textOutBox, contentHash)
          .send({ from });
      }
      console.log('tx', tx);
      return;
    } catch (e) {
      return resolveAsStatusMessage('Could send message!', e);
    }
  }

  public async getInBoxCount(): Promise<number | StatusMessage> {
    try {
      const res0 = await this.contract.methods.getInBoxCount().call({ from: this.web3Session.publicAddress });
      return Number(res0);
    } catch (e) {
      return resolveAsStatusMessage('Could not call length of inbox!', e);
    }
  }

  public async confirm(index: number): Promise<void | StatusMessage> {
    try {
      const tx = await this.contract.methods.confirm(index).send({ from: this.web3Session.publicAddress });
      console.log(tx);
    } catch (e) {
      return resolveAsStatusMessage(`Could not confirm message (${index + 1})`, e);
    }
  }

  public async getInBoxEntry(index: number): Promise<GetInBoxResult | StatusMessage> {
    const tag = '<getInBoxEntry>';
    try {
      const entry: any = await this.contract.methods
        .getInBoxEntry(index)
        .call({ from: this.web3Session.publicAddress });
      return {
        sender: entry.sender,
        indexOutBox: Number(entry.indexOutBox),
        subjectInBox: entry.subjectInBox,
        textInBox: entry.textInBox,
        inserted: Number(entry.inserted),
        confirmedTime: Number(entry.confirmedTime),
        confirmed: entry.confirmed,
        hasReply: entry.hasReply,
        replyIndex: Number(entry.replyIndex),
        contentHash: entry.contentHash.toString(),
        index
      };
    } catch (e) {
      return resolveAsStatusMessage(tag, e);
    }
  }

  public async getOutBoxCount(): Promise<number | StatusMessage> {
    const tag = '<getOutBoxCount>';
    try {
      const res0 = await this.contract.methods.getOutBoxCount().call({ from: this.web3Session.publicAddress });
      return Number(res0);
    } catch (e) {
      return resolveAsStatusMessage(tag, e);
    }
  }

  public async getOutBox(index: number): Promise<GetOutBoxResult | StatusMessage> {
    const tag = '<getOutBox>';
    try {
      const entry: any = await this.contract.methods
        .getOutBoxEntry(index)
        .call({ from: this.web3Session.publicAddress });
      return {
        receiver: entry.receiver,
        indexInBox: Number(entry.indexInBox),
        subjectOutBox: entry.subjectOutBox,
        textOutBox: entry.textOutBox,
        inserted: Number(entry.inserted),
        confirmedTime: Number(entry.confirmedTime),
        confirmed: entry.confirmed,
        hasReply: entry.hasReply,
        replyIndex: Number(entry.replyIndex),
        contentHash: entry.contentHash,
        index
      };
    } catch (e) {
      return resolveAsStatusMessage(tag, e);
    }
  }

  public async getPublicKey(addr = this.web3Session.publicAddress): Promise<StatusMessage | Uint8Array> {
    if (this.publicKeyCache[addr]) {
      return this.publicKeyCache[addr];
    }
    const pks = await this.getPublicKeyStore();
    const publicKey = await pks.getPublicKey(addr);
    if (!publicKey) {
      return errorMessage(`Address ${displayAddress(addr)} does not have a Public Key registered!`);
    }
    if (isStatusMessage(publicKey)) {
      return publicKey;
    }

    this.publicKeyCache[addr] = Buffer.from(publicKey, 'base64');
    return this.publicKeyCache[addr];
  }

  public async getSecretKey(): Promise<StatusMessage | Uint8Array> {
    const pks = await this.getPublicKeyStore();
    return pks.getSecretKey();
    // const encPrivateKey = await pks.getEncSecretKey(this.web3Session.publicAddress);
    // if (isStatusMessage(encPrivateKey)) {
    //   return encPrivateKey;
    // }
    // const secretKey = await this.web3Session.decryptFun(Buffer.from(encPrivateKey, 'base64'));
    // if (!secretKey) {
    //   return errorMessage('Could not decrypt private key!');
    // }
    // return secretKey;
  }

  public async decryptEncMessage(encData: string, sender = this.web3Session.publicAddress) {
    const senderPublicKey = await this.getPublicKey(sender);
    if (isStatusMessage(senderPublicKey)) {
      return senderPublicKey;
    }

    const receiverSecretKey = await this.getSecretKey();
    if (isStatusMessage(receiverSecretKey)) {
      return errorMessage('Could not decrypt private key!');
    }

    const data = decryptContentFromSender({ receiverSecretKey, encData, senderPublicKey });
    return data === null || data === '' ? errorMessage('Could not decrypt data!') : data;
  }

  public async encryptContent(
    data: string,
    receiver = this.web3Session.publicAddress
  ): Promise<StatusMessage | string> {
    const receiverPublicKey = await this.getPublicKey(receiver);
    if (isStatusMessage(receiverPublicKey)) {
      return receiverPublicKey;
    }

    const senderSecretKey = await this.getSecretKey();
    if (isStatusMessage(senderSecretKey)) {
      return errorMessage('Could not decrypt private key!');
    }

    const encData = encryptContentForReceiver({ data, receiverPublicKey, senderSecretKey });

    return encData || errorMessage('Could not encrypt data!');
  }
}

export const deployPrivateMessageV2Contract: DeploymentFunction = async (web3Session: Web3Session) => {
  const { web3, publicAddress } = web3Session;
  const publicKeyStoreV2Address = await deployContract({
    web3,
    contractABI: JSON.stringify(publicKeyStoreV2Abi),
    contractBytecode: publicKeyStoreV2bytecode,
    from: publicAddress,
    constructorArgs: []
  });
  if (isStatusMessage(publicKeyStoreV2Address)) {
    return publicKeyStoreV2Address;
  }
  return await deployContract({
    web3,
    contractABI: JSON.stringify(privateMessageStoreV2Abi),
    contractBytecode: privateMessageStoreV2Bytecode,
    from: publicAddress,
    constructorArgs: [publicKeyStoreV2Address]
  });
};
