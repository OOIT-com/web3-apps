import Arweave from 'arweave';

import { ethers } from 'ethersv5';
import { NodeIrys, WebIrys } from '@irys/sdk';
import { getNetworkInfo } from '../network-info';
import { errorMessage, isStatusMessage, StatusMessage, Web3Session } from '../types';
import { Buffer } from 'buffer';
import { UploadResponse } from '@irys/sdk/build/esm/common/types';
import type { Readable } from 'stream';

export type IrysType = WebIrys | NodeIrys;

export class IrysAccess {
  private web3Session: Web3Session;
  private irys: IrysType | undefined;

  constructor(web3Session: Web3Session) {
    this.web3Session = web3Session;
  }

  public async init(): Promise<StatusMessage | undefined> {
    const irys = await getWebIrys(this.web3Session);
    if (isStatusMessage(irys)) {
      return irys;
    }
    this.irys = irys;
  }

  public getToken(): string {
    return this.irys?.token || '';
  }

  public getWeb3Session(): Web3Session {
    return this.web3Session;
  }

  public getNetworkId(): number {
    return this.web3Session.networkId;
  }

  public getAddress(): string {
    return this.irys?.address || '';
  }

  public async getBalance(address: string) {
    return this.irys?.getBalance(address) || Promise.resolve('');
  }

  public async getLoadedBalance() {
    return this.irys?.getLoadedBalance() || Promise.resolve('');
  }

  public getPrice(bytes: number) {
    return this.irys?.getPrice(bytes) || 0;
  }

  public fund(amount: string) {
    return this.irys?.fund(amount);
  }

  public toAtomic(amount: any) {
    return this.irys?.utils.toAtomic(amount);
  }

  public withdrawBalance(amount: any) {
    return this.irys?.withdrawBalance(amount);
  }

  public async upload(data: string | Buffer | Readable, tags: Tags): Promise<UploadResponse | StatusMessage> {
    if (!this.irys) {
      return errorMessage('Irys not initialized!');
    }
    return this.irys.upload(data, { tags });
  }
}

const getWebIrys = async ({ networkId }: { networkId: number }): Promise<IrysType | StatusMessage> => {
  const { currencySymbol, isMainnet } = getNetworkInfo(networkId);
  const url = process.env.REACT_APP_IRYS_URL || '';

  const token = currencySymbol;
  // if (!token) {
  //   return errorMessage(`No Irys Token defined for ${name}!`);
  // }
  if (!url) {
    return errorMessage('Irys URL is unset (REACT_APP_IRYS_URL)!');
  }

  const w: any = window;
  await w.ethereum.enable();

  // const provider = new BrowserProvider(w.ethereum);
  const provider = new ethers.providers.Web3Provider(w.ethereum);

  let network = 'devnet';
  let rpcUrl = process.env.REACT_APP_IRYS_RPC_URL_DEV || '';
  if (isMainnet) {
    network = 'mainnet';
    rpcUrl = '';
  }
  // Devnet RPC URLs change often, use a recent one from https://chainlist.org
  // const rpcUrl = networkInfo.rpcUrl;
  console.log('irys:', { token, url, rpcUrl, isMainnet });

  const wallet = { rpcUrl: '', name: 'ethersv5', provider: provider };
  // Use the wallet object
  const webIrys = new WebIrys({ network, token, wallet });
  await webIrys.ready();

  return webIrys;
};

export type Tags = {
  name: string;
  value: string;
}[];

export const initArweave = () =>
  Arweave.init({
    host: process.env.ARWEAVE_HOST,
    port: process.env.ARWEAVE_PORT,
    protocol: process.env.ARWEAVE_PROTOCOL
  });
