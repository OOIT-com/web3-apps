import { Contract } from 'web3-eth-contract';
import { errorMessage, isStatusMessage, StatusMessage, Web3Session } from '../../types';

import { secureBlockchainTableAbi } from './SecureBlockchainTable';
import {
  ContractData,
  ContractDataWithIndex,
  getContractRegistry
} from '../contract-registry/ContractRegistry-support';
import { resolveAsStatusMessage } from '../../utils/status-message-utils';
import { getOwnableWithBackup, OwnableWithBackup } from '../ownable-with-backup/OwnableWithBackup-support';
import { decryptContent, EncPrefix, encryptContent, secretKey64ToBoxKeyPair } from '../../utils/nacl-util';
import { BoxKeyPair } from 'tweetnacl';
import { toNumber } from '../contract-utils';
import { decryptBase64 } from '../../utils/enc-dec-utils';

type SecureBlockchainTableAbiType = typeof secureBlockchainTableAbi;
type SecureBlockchainTableType = Contract<SecureBlockchainTableAbiType>;

export type DataRowEntry<T = unknown> = {
  userAddress: string;
  content: string;
  status: number;
  created: number;
  rowIndex: number;
  version: number;
  data?: T;
};

export async function getSecureBlockchainTableList(): Promise<StatusMessage | ContractDataWithIndex[]> {
  const contractRegistry = getContractRegistry();
  if (!contractRegistry) {
    return errorMessage('Contract Registry not available!');
  }
  const smEntries: ContractDataWithIndex[] = [];
  const count = await contractRegistry.getContractDataCount();
  if (isStatusMessage(count)) {
    return count;
  }
  for (let i = 0; i < count; i++) {
    const res = await contractRegistry.getContractData(i);
    if (isStatusMessage(res)) {
      console.error(res);
    } else if (res.contractName === 'SecureBlockchainTable') {
      smEntries.push(res);
    }
  }

  return smEntries;
}

export class SBTManager {
  public readonly name: string;
  public readonly web3Session: Web3Session;
  public readonly publicAddress: string;
  public editable: boolean = false;
  public readonly owb: OwnableWithBackup;

  private readonly contract: SecureBlockchainTableType;
  private keyMyKeyPair: BoxKeyPair | undefined = undefined;

  constructor({ name, contractAddress }: ContractData, web3Session: Web3Session) {
    const { web3, publicAddress } = web3Session;
    this.web3Session = web3Session;
    this.name = name;
    this.publicAddress = publicAddress;
    this.contract = new web3.eth.Contract(secureBlockchainTableAbi, contractAddress, web3);
    this.owb = getOwnableWithBackup(web3, contractAddress);
  }

  public async init() {
    await this.getMyKeyPair();
  }

  public async refreshEditable() {
    const res = await this.isEditable();
    if (isStatusMessage(res)) {
      console.error(res.userMessage);
    } else {
      this.editable = res;
    }
  }

  public async isOwner(): Promise<boolean | StatusMessage> {
    const owner = await this.owb.owner();
    if (isStatusMessage(owner)) {
      return owner;
    }
    return owner === this.publicAddress;
  }

  public async getMyEncSecret(): Promise<string | StatusMessage> {
    return this.getUserEncSecret(this.publicAddress);
  }

  public async getUserEncSecret(userAddress: string): Promise<string | StatusMessage> {
    const tag = '<Get User Secret>';
    try {
      return this.contract.methods.userEncSecretMap(userAddress).call();
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async removeEncSecret(userAddress: string): Promise<StatusMessage | undefined> {
    const tag = '<Remove Enc Secret>';
    try {
      const from = this.publicAddress;
      await this.contract.methods.removeEncSecret(userAddress).call({ from });
      await this.contract.methods.removeEncSecret(userAddress).send({ from });
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async setEncSecret(userAddress: string, encSecret: string): Promise<undefined | StatusMessage> {
    const tag = '<Set Enc Secret>';
    try {
      const from = this.publicAddress;
      await this.contract.methods.setEncSecret(userAddress, encSecret).call({ from });
      await this.contract.methods.setEncSecret(userAddress, encSecret).send({ from });
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async getUserCount(): Promise<number | StatusMessage> {
    const tag = '<Get User Count>';
    try {
      return toNumber(await this.contract.methods.getUserCount().call());
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async getUser(index: number): Promise<string | StatusMessage> {
    const tag = '<Get User>';
    try {
      return await this.contract.methods.getUser(index).call();
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async getUsers(): Promise<string[] | StatusMessage> {
    const tag = '<Get User List>';
    const users: string[] = [];
    try {
      const count = await this.getUserCount();
      if (isStatusMessage(count)) {
        return count;
      }
      for (let i = 0; i < count; i++) {
        const user = await this.getUser(i);
        if (isStatusMessage(user)) {
          return user;
        }
        users.push(user.toLowerCase());
      }
      return users;
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async setEditable(editable: boolean): Promise<undefined | StatusMessage> {
    const tag = '<Set Editable>';
    try {
      const from = this.publicAddress;
      await this.contract.methods.setEditable(editable).call({ from });
      await this.contract.methods.setEditable(editable).send({ from });
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async isEditable(): Promise<boolean | StatusMessage> {
    const tag = '<Is Editable>';
    try {
      const from = this.publicAddress;
      return await this.contract.methods.isEditable().call({ from });
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async setMetaData(dataDefinition: string): Promise<undefined | StatusMessage> {
    const tag = '<Set Data Definition>';
    try {
      const from = this.publicAddress;
      await this.contract.methods.setMetaData(dataDefinition).call({ from });
      await this.contract.methods.setMetaData(dataDefinition).send({ from });
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async getMetaData(): Promise<string | StatusMessage> {
    try {
      return await this.contract.methods.getMetaData().call();
    } catch (e) {
      return resolveAsStatusMessage('Error in getMetaData!', e);
    }
  }

  public async setInitialData(dataDefinition: string): Promise<undefined | StatusMessage> {
    const tag = '<Set Initial Data>';
    try {
      const from = this.publicAddress;
      await this.contract.methods.setInitialData(dataDefinition).call({ from });
      await this.contract.methods.setInitialData(dataDefinition).send({ from });
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async getInitialData(): Promise<string | StatusMessage> {
    try {
      return await this.contract.methods.getInitialData().call();
    } catch (e) {
      return resolveAsStatusMessage('Error in getInitialData!', e);
    }
  }

  public async getRowCount(): Promise<number | StatusMessage> {
    const tag = '<getRowCount>';
    try {
      return toNumber(await this.contract.methods.getDataRowCount().call());
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async getVersionCount(row: number): Promise<number | StatusMessage> {
    const tag = '<getVersionCount>';
    try {
      return toNumber(await this.contract.methods.getDataRowVersionCount(row).call());
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async getRowData<O>(rowIndex: number, version: number): Promise<DataRowEntry | StatusMessage> {
    const tag = '<getLatestVersion>';
    try {
      const o: DataRowEntry<O> = await this.contract.methods.getDataRow(rowIndex, version).call();
      o.created = toNumber(o.created);
      o.status = toNumber(o.status);
      o.version = toNumber(o.version);
      return { ...o, rowIndex };
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async getLatestVersion<O>(rowIndex: number): Promise<DataRowEntry<O> | StatusMessage> {
    const tag = '<getLatestVersion>';
    try {
      const count = await this.getVersionCount(rowIndex);
      if (isStatusMessage(count)) {
        return count;
      }
      const o: DataRowEntry<O> = await this.contract.methods.getLatestDataRowVersion(rowIndex).call();
      o.created = toNumber(o.created);
      o.status = toNumber(o.status);
      o.version = toNumber(o.version);
      return { ...o, rowIndex };
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async getLatestRowData<T>(): Promise<DataRowEntry<T>[] | StatusMessage> {
    const tag = '<getLatestAllData>';
    try {
      const rowDataList: DataRowEntry<T>[] = [];
      const rowCount = await this.getRowCount();
      if (isStatusMessage(rowCount)) {
        return rowCount;
      }

      for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        const o = await this.getLatestVersion<T>(rowIndex);
        if (isStatusMessage(o)) {
          console.error(o);
        } else {
          rowDataList.push(o);
        }
      }
      return rowDataList;
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async getRowDataWithVersions(): Promise<DataRowEntry[][] | StatusMessage> {
    const tag = '<getAllData>';
    try {
      const allData: DataRowEntry[][] = [];
      const rowCount = await this.getRowCount();
      if (isStatusMessage(rowCount)) {
        return rowCount;
      }
      for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        const versions: DataRowEntry[] = [];
        allData.push(versions);
        const versionCount = await this.getVersionCount(rowIndex);
        if (isStatusMessage(versionCount)) {
          return versionCount;
        }
        for (let version = 0; version < versionCount; version++) {
          const o = await this.getRowData(rowIndex, version);
          if (isStatusMessage(o)) {
            return o;
          } else {
            versions.push(o);
          }
        }
      }
      return allData;
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async setDataRow(rowIndex: number, content: string): Promise<StatusMessage | undefined> {
    const tag = '<Set Data Row>';
    try {
      await this.contract.methods.setDataRow(rowIndex, content, 1).call({ from: this.publicAddress });
      await this.contract.methods.setDataRow(rowIndex, content, 1).send({ from: this.publicAddress });
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async addRowData(content: string): Promise<StatusMessage | number> {
    const tag = '<addRowData>';
    try {
      await this.contract.methods.addDataRow(content, 1).call({ from: this.publicAddress });
      const promiEvent = this.contract.methods.addDataRow(content, 1).send({ from: this.publicAddress });

      const p = new Promise<number>((resolve) => {
        promiEvent.on('confirmation', ({ receipt }) => {
          resolve(17);
        });
      });
      return await p;
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async getMyKeyPair(): Promise<BoxKeyPair | StatusMessage> {
    if (this.keyMyKeyPair) {
      return this.keyMyKeyPair;
    }
    const encSecret = await this.getMyEncSecret();
    if (isStatusMessage(encSecret)) {
      return encSecret;
    }
    if (encSecret) {
      const secret64 = await decryptBase64(encSecret, this.web3Session.decryptFun);
      if (isStatusMessage(secret64)) {
        return secret64;
      } else {
        this.keyMyKeyPair = secretKey64ToBoxKeyPair(secret64);
        return this.keyMyKeyPair;
      }
    }
    return errorMessage('No Encrypted Secret available!');
  }

  public isEncrypted = (data: string) => data.startsWith(EncPrefix);

  public async decryptEncContent(encContent: string) {
    if (!this.isEncrypted(encContent)) {
      return errorMessage('Content is missing enc-prefix!');
    }
    const keypair = await this.getMyKeyPair();
    if (isStatusMessage(keypair)) {
      return keypair;
    }
    return decryptContent({ data: encContent, secret: keypair });
  }

  public async encryptContent(content: string) {
    const keypair = await this.getMyKeyPair();
    if (isStatusMessage(keypair)) {
      return keypair;
    }
    return EncPrefix + encryptContent({ data: content, secret: keypair });
  }
}
