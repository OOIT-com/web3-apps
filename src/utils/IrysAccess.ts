import { ethers } from 'ethers';
import { UploadBuilder, WebUploader } from '@irys/web-upload';
import { WebAvalanche, WebEthereum, WebMatic } from '@irys/web-upload-ethereum';
import { EthersV6Adapter } from '@irys/web-upload-ethereum-ethers-v6';
import { errorMessage, isStatusMessage, StatusMessage, Web3Session } from '../types';
import { getNetworkInfo } from '../network-info';
import { Buffer } from 'buffer';
import type { Readable } from 'stream';
import { UploadResponse } from '@irys/sdk/build/esm/common/types';
import BaseWebIrys from '@irys/web-upload/dist/types/base';

export type Tags = {
  name: string;
  value: string;
}[];
const w = window as any;

export class IrysAccess {
  public readonly web3Session: Web3Session;
  private irys: BaseWebIrys | undefined;

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
    return this.irys?.token ?? '';
  }

  public getAddress(): string {
    return this.irys?.address ?? '';
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

const getWebIrys = async (web3Session: Web3Session): Promise<UploadBuilder | StatusMessage> => {
  const { networkId } = web3Session;

  const { currencySymbol, isMainnet } = getNetworkInfo(networkId);
  const provider = new ethers.BrowserProvider(w.ethereum);
  let uploader;
  switch (currencySymbol) {
    case 'ETH':
      uploader = WebUploader(WebEthereum).withAdapter(EthersV6Adapter(provider));
      break;
    case 'MATIC':
      uploader = WebUploader(WebMatic).withAdapter(EthersV6Adapter(provider));
      break;
    case 'AVAX':
      uploader = WebUploader(WebAvalanche).withAdapter(EthersV6Adapter(provider));
      break;
    default:
      return errorMessage(`Blockchain with token ${currencySymbol} not supported`);
  }
  const rpcUrl: string | undefined = process.env.REACT_APP_IRYS_RPC_URL_DEV ?? '';
  if (!isMainnet && rpcUrl) {
    uploader.withRpc(rpcUrl).devnet();
  }
  return uploader;
};
