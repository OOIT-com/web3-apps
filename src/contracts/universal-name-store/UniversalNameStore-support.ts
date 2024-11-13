import { Contract } from 'web3-eth-contract';
import { errorMessage, isStatusMessage, StatusMessage, Web3Session } from '../../types';

import { universalNameStoreAbi } from './UniversalNameStore';
import { resolveAsStatusMessage } from '../../utils/status-message-utils';
import { getOwnableWithBackup, OwnableWithBackup } from '../ownable-with-backup/OwnableWithBackup-support';
import { ContractName, getContractAddress } from '../contract-utils';
import { BigNumber } from '@ethersproject/bignumber';
import { displayAddress } from '../../utils/misc-util';
import { isZeroAddress } from '../../utils/constant-utils';

type UniversalNameStoreAbiType = typeof universalNameStoreAbi;
type UniversalNameStoreType = Contract<UniversalNameStoreAbiType>;

export type NameAddressEntry = {
  address: string;
  name: string;
  owner: string;
};

export type UniversalNameProperty = { key: string; value: string; index: number };

let instance: UniversalNameStore | undefined = undefined;

export async function getUniversalNameStore(web3Session: Web3Session): Promise<UniversalNameStore | StatusMessage> {
  if (instance) {
    return instance;
  }
  const { networkId } = web3Session;
  const contractAddress = getContractAddress(networkId, ContractName.UNIVERSAL_NAME_STORE);
  if (!contractAddress) {
    return errorMessage(`No contract address found in .env found for ${ContractName.UNIVERSAL_NAME_STORE}!`);
  }

  instance = new UniversalNameStore(web3Session, contractAddress);
  return instance;
}

export class UniversalNameStore {
  public feeAmount: BigNumber = BigNumber.from(0);
  public readonly web3Session: Web3Session;
  public readonly publicAddress: string;
  public editable: boolean = false;
  public readonly owb: OwnableWithBackup;
  public readonly contractAddress: string;

  private readonly contract: UniversalNameStoreType;

  constructor(web3Session: Web3Session, contractAddress: string) {
    const { web3, publicAddress } = web3Session;
    this.web3Session = web3Session;
    this.publicAddress = publicAddress;
    this.contract = new web3.eth.Contract(universalNameStoreAbi, contractAddress, web3);
    this.owb = getOwnableWithBackup(web3, contractAddress);
    this.contractAddress = contractAddress;
  }

  public async registerForEvents(listener: (e: string) => void) {
    this.contract.events.allEvents().on('data', (event) => {
      console.log('Event:', event);
      listener(event.event);
      // Process the event data as needed
    });
    const events = await this.contract.getPastEvents();
    events.forEach((e) => listener(typeof e === 'string' ? e : e.event));
  }

  public async getFee(): Promise<BigNumber | StatusMessage> {
    const tag = '<Get Fee>';
    try {
      const bn = await this.contract.methods.getFee().call();
      this.feeAmount = BigNumber.from(bn);
      return this.feeAmount;
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async setFee(fee: BigNumber): Promise<undefined | StatusMessage> {
    const tag = '<Set Fee>';
    try {
      const from = this.publicAddress;
      const feeValue = fee.toString();
      await this.contract.methods.setFee(feeValue).call({ from });
      await this.contract.methods.setFee(feeValue).send({ from });
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async getOwnership(addr: string): Promise<string | StatusMessage> {
    const tag = `<Get Ownership for ${displayAddress(addr)}>`;
    try {
      return await this.contract.methods.getOwnership(addr).call();
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async getName(addr: string): Promise<string | StatusMessage> {
    const tag = '<Get Name>';
    try {
      return await this.contract.methods.getName(addr).call();
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async checkValidString(name: string): Promise<boolean | StatusMessage> {
    const tag = `<Check Valid Name ${name}>`;
    try {
      const res = await this.contract.methods.checkValidString(name).call();
      return res;
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async getAddressByName(name: string): Promise<string | StatusMessage> {
    const tag = `<Get Address By Name ${name}>`;
    try {
      const res = await this.contract.methods.getAddressByName(name).call();
      if (isZeroAddress(res)) {
        return '';
      }
      return res.toLowerCase();
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async getAddressByIndex(index: number): Promise<string | StatusMessage> {
    const tag = `<Get Address By Index ${index}>`;
    try {
      return await this.contract.methods.getAddressByIndex(index).call();
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async registerName(name: string, contractAddress?: string): Promise<undefined | StatusMessage> {
    const tag = '<Register Name>';
    try {
      const from = this.publicAddress;
      const value = this.feeAmount.toString();
      if (contractAddress) {
        await this.contract.methods.registerContractName(name, contractAddress).call({ from, value });
        await this.contract.methods.registerContractName(name, contractAddress).send({ from, value });
      } else {
        await this.contract.methods.registerMyName(name).call({ from, value });
        await this.contract.methods.registerMyName(name).send({ from, value });
      }
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async deleteName(name: string): Promise<undefined | StatusMessage> {
    const tag = '<Delete Name>';
    try {
      const from = this.publicAddress;
      const value = this.feeAmount.toString();
      await this.contract.methods.deleteName(name).call({ from, value });
      await this.contract.methods.deleteName(name).send({ from, value });
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async getAddressCount(): Promise<BigInt | StatusMessage> {
    const tag = '<Get User Count>';
    try {
      return await this.contract.methods.getAddressCount().call();
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  // Owner Stuff
  public async withdraw(amountWei: BigNumber): Promise<undefined | StatusMessage> {
    const tag = `<Withdraw ${amountWei.toString()}>`;
    try {
      const from = this.publicAddress;
      await this.contract.methods.withdraw(amountWei.toString()).call({ from });
      await this.contract.methods.withdraw(amountWei.toString()).send({ from });
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async getAllAddresses(start = 0, size = -1): Promise<NameAddressEntry[] | StatusMessage> {
    const tag = '<Get User List>';
    const list: NameAddressEntry[] = [];
    try {
      const count = await this.getAddressCount();
      if (isStatusMessage(count)) {
        return count;
      }
      const max = start + (size === -1 ? +count.toString() : size);
      for (let i = 0; i < max; i++) {
        const address = await this.getAddressByIndex(i);
        if (isStatusMessage(address)) {
          return address;
        }
        const name = await this.getName(address);
        if (isStatusMessage(name)) {
          return name;
        }
        const owner = await this.getOwnership(address);
        if (isStatusMessage(owner)) {
          return owner;
        }
        list.push({ address, name, owner: isZeroAddress(owner) ? address : owner });
      }
      return list;
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async getKeyCountByAddress(addr: string): Promise<BigInt | StatusMessage> {
    const tag = '<Get Key Count>';
    try {
      return await this.contract.methods.getKeyCountByAddress(addr).call();
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async getKeyByAddress(addr: string, index: number): Promise<string | StatusMessage> {
    const tag = '<Get Key By Address>';
    try {
      return await this.contract.methods.getKeyByAddress(addr, index).call();
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async getValueByAddress(addr: string, key: string): Promise<string | StatusMessage> {
    const tag = '<Get Key By Address>';
    try {
      return await this.contract.methods.getValueByAddress(addr, key).call();
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async setValue(name: string, key: string, value: string): Promise<void | StatusMessage> {
    const tag = '<Set Value>';
    try {
      const fee = await this.getFee();

      if (isStatusMessage(fee)) {
        return fee;
      }
      const from = this.publicAddress;
      const v = fee.toString();
      await this.contract.methods.setValue(name, key, value).call({ value: v, from });
      await this.contract.methods.setValue(name, key, value).send({ value: v, from });
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async removeValue(name: string, key: string): Promise<void | StatusMessage> {
    const tag = '<Set Value>';
    try {
      const fee = await this.getFee();
      if (isStatusMessage(fee)) {
        return fee;
      }
      const from = this.publicAddress;
      const value = fee.toString();
      await this.contract.methods.removeValue(name, key).call({ value, from });
      await this.contract.methods.removeValue(name, key).send({ value, from });
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async getProperties(addr: string): Promise<UniversalNameProperty[] | StatusMessage> {
    const properties: UniversalNameProperty[] = [];

    const keyCount = await this.getKeyCountByAddress(addr);
    if (isStatusMessage(keyCount)) {
      return keyCount;
    }
    for (let index = 0; index < +keyCount.toString(); index++) {
      const key = await this.getKeyByAddress(addr, index);
      if (isStatusMessage(key)) {
        return key;
      }
      const value = await this.getValueByAddress(addr, key);
      if (isStatusMessage(value)) {
        return value;
      }
      properties.push({ key, value, index });
    }

    return properties;
  }
}
