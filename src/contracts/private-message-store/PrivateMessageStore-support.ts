import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { errorMessage, isStatusMessage, StatusMessage, successMessage } from '../../types';
import { encryptContent } from '../../utils/metamask-util';

import { privateMessageStoreAbi } from './PrivateMessageStore-abi';
import { ContractRegistry } from '../contract-registry/ContractRegistry-support';
import { ContractName } from '../contract-utils';
import { resolveAsStatusMessage } from '../../utils/status-message-utils';

type PrivateMessageStoreAbiType = typeof privateMessageStoreAbi;
type PrivateMessageStoreType = Contract<PrivateMessageStoreAbiType>;

type SendArgs = {
  address: string;
  subjectInBox: string;
  textInBox: string;
  subjectOutBox: string;
  textOutBox: string;
  contentHash: string;
};

type ReplyArgs = {
  address: string;
  replySubjectInBox: string;
  replyTextInBox: string;
  replySubjectOutBox: string;
  replyTextOutBox: string;
  contentHash: string;
  replyIndex: number;
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

export type EncryptMessageArgs = {
  publicKey: string;
  subject: string;
  text: string;
  nonce: number;
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

export type EncryptMessageResult = { subjectEnc: string; textEnc: string };

export async function initPrivateMessageStore(contractRegistry: ContractRegistry, web3: Web3): Promise<StatusMessage> {
  const res = await contractRegistry.getByName(ContractName.PRIVATE_MESSAGE_STORE);
  if (isStatusMessage(res)) {
    return res;
  }

  const contractAddress = res.contractAddress;
  if (!contractAddress) {
    return errorMessage(`No contract found for ${ContractName.PRIVATE_MESSAGE_STORE}`);
  }
  const contract = new web3.eth.Contract(privateMessageStoreAbi, contractAddress, web3);

  instance = new PrivateMessageStore(contract);
  return successMessage(`Successfully initialized ${ContractName.PRIVATE_MESSAGE_STORE}`);
}

let instance: PrivateMessageStore | undefined;
export const getPrivateMessageStore = () => instance;

export class PrivateMessageStore {
  private readonly contract: PrivateMessageStoreType;

  constructor(contract: PrivateMessageStoreType) {
    this.contract = contract;
  }

  public async getMaxLengthText(): Promise<number> {
    const res = await this.contract.methods.MAX_LENGTH_TEXT().call();
    return Number(res);
  }

  public async getMaxLengthSubject(): Promise<number | StatusMessage> {
    return Number.parseInt(await this.contract.methods.MAX_LENGTH_SUBJECT().call());
  }

  public async send(
    from: string,
    { address, subjectInBox, textInBox, subjectOutBox, textOutBox, contentHash }: SendArgs
  ): Promise<void | StatusMessage> {
    try {
      const tx = await this.contract.methods
        .send(address, subjectInBox, textInBox, subjectOutBox, textOutBox, contentHash)
        .send({ from });
      console.log('tx', tx);
      return;
    } catch (e) {
      return resolveAsStatusMessage('Could send message!', e);
    }
  }

  public async lenInBox(from: string): Promise<number | StatusMessage> {
    try {
      const res0 = await this.contract.methods.lenInBox().call({ from });
      return Number(res0);
    } catch (e) {
      return resolveAsStatusMessage('Could not call length of inbox!', e);
    }
  }

  public async confirm(from: string, index: number): Promise<void | StatusMessage> {
    try {
      const tx = await this.contract.methods.confirm(index).send({ from });
      console.log(tx);
    } catch (e) {
      return resolveAsStatusMessage(`Could not confirm message (${index + 1})`, e);
    }
  }

  public async reply(
    from: string,
    {
      address,
      replySubjectInBox,
      replyTextInBox,
      replySubjectOutBox,
      replyTextOutBox,
      contentHash,
      replyIndex
    }: ReplyArgs
  ): Promise<void | StatusMessage> {
    try {
      const tx = await this.contract.methods
        .reply(address, replySubjectInBox, replyTextInBox, replySubjectOutBox, replyTextOutBox, contentHash, replyIndex)
        .send({ from });
      console.log('tx', tx);
      return;
    } catch (e) {
      console.error('PrivateMessageStore_reply failed', e);
      return errorMessage('Could not call PrivateMessageStore_reply', e);
    }
  }

  public async getInBox(from: string, index: number): Promise<GetInBoxResult | StatusMessage> {
    try {
      const entry = await this.contract.methods.getInBox(index).call({ from });
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
      console.error('PrivateMessageStore_getInBox failed', e);
      return errorMessage('Could not get in box entry', e);
    }
  }

  public async lenOutBox(from: string): Promise<number | StatusMessage> {
    try {
      const res0 = await this.contract.methods.lenOutBox().call({ from });
      return Number(res0);
    } catch (e) {
      console.error('PrivateMessageStore_lenOutBox failed', e);
      return errorMessage('Could not call PrivateMessageStore_lenOutBox', e);
    }
  }

  public async getOutBox(from: string, index: number): Promise<GetOutBoxResult | StatusMessage> {
    try {
      const entry: any = await this.contract.methods.getOutBox(index).call({ from });
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
      console.error('PrivateMessageStore_getOutBox failed', e);
      return errorMessage('Could not get out box entry', e);
    }
  }

  public async encryptMessage({
    publicKey,
    subject,
    text,
    nonce
  }: EncryptMessageArgs): Promise<EncryptMessageResult | StatusMessage> {
    const enc = encryptContent(publicKey, { subject, text, nonce });
    const subjectMax = await this.getMaxLengthSubject();
    if (isStatusMessage(subjectMax)) {
      return subjectMax;
    }
    const textMax = await this.getMaxLengthText();
    if (isStatusMessage(textMax)) {
      return textMax;
    }
    const subjectEnc = enc.substring(0, +subjectMax);
    const textEnc = enc.substring(+subjectMax, +textMax);
    return { subjectEnc, textEnc };
  }
}

// DECRYPT MESSAGE

export const web3ContentHash = (subject: string, text: string): string => Web3.utils.keccak256(subject + '-' + text);
