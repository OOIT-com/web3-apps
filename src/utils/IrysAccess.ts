import { ethers } from 'ethers';
import { UploadBuilder, WebUploader } from '@irys/web-upload';
import { WebAvalanche, WebEthereum, WebMatic } from '@irys/web-upload-ethereum';
import { EthersV6Adapter } from '@irys/web-upload-ethereum-ethers-v6';
import { Web3Session } from '../types';
import { getNetworkInfo } from '../network-info';
import { Buffer } from 'buffer';
import type { Readable } from 'stream';
import { Web3BaseProvider } from 'web3';
import { errorMessage, isStatusMessage, StatusMessage } from './status-message';
import BaseWebIrys from '@irys/web-upload/dist/types/base';

export type ResponseType = { id: string; timestamp: number };

export type Tags = {
  name: string;
  value: string;
}[];

export const newIrysAccess = async (web3Session: Web3Session): Promise<IrysAccess | StatusMessage> => {
  const irys = new IrysAccess(web3Session);
  const r = await irys.init();
  if (isStatusMessage(r)) {
    console.debug(r.userMessage);
    return r;
  }
  return irys;
};

export class IrysAccess {
  public readonly web3Session: Web3Session;
  private irys: BaseWebIrys | undefined;

  constructor(web3Session: Web3Session) {
    this.web3Session = web3Session;
  }

  public async init(): Promise<StatusMessage | UploadBuilder> {
    const irys = await getWebIrys(this.web3Session);
    if (!isStatusMessage(irys)) {
      this.irys = irys;
    }
    return irys;
  }

  public getToken(): string {
    return this.irys?.token ?? '';
  }

  public getAddress(): string {
    return this.irys?.address ?? '';
  }

  public async getBalance(address: string): Promise<string> {
    if (this.irys) {
      return (await this.irys.getBalance(address)).toString();
    }
    return '';
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

  public async upload(data: string | Buffer | Readable, tags: Tags): Promise<StatusMessage | ResponseType> {
    if (!this.irys) {
      return errorMessage('Irys not initialized!');
    }
    return (await this.irys.upload(data, { tags })) as ResponseType;
  }
}

// funding does not work but file upload is working!
const getWebIrys = async (web3Session: Web3Session): Promise<UploadBuilder | StatusMessage> => {
  const { chainId, web3 } = web3Session;

  const { currencySymbol, isMainnet } = getNetworkInfo(chainId);
  //const provider = new ethers.BrowserProvider(w.ethereum);
  const provider = web3.currentProvider as Web3BaseProvider;
  // const provider = new ethers.JsonRpcProvider(rpcUrl); // Replace with your provider URL
  const ethersProvider = new ethers.BrowserProvider(provider);

  const signer = new ethers.Wallet(web3Session.privateKey, ethersProvider);

  ethersProvider.estimateGas = signer.estimateGas.bind(signer);

  (ethersProvider as any).getSigner = () => signer;

  //const signer2 = await ethersProvider.getSigner();
  let uploader;
  switch (currencySymbol) {
    case 'ETH':
      uploader = WebUploader(WebEthereum).withAdapter(EthersV6Adapter(signer));
      break;
    case 'MATIC':
      uploader = WebUploader(WebMatic).withAdapter(EthersV6Adapter(signer));
      break;
    case 'AVAX':
      uploader = WebUploader(WebAvalanche).withAdapter(
        EthersV6Adapter(
          //{ ...provider, getSigner: () => signer, estimateGas: signer.estimateGas }
          ethersProvider
        )
      );
      break;
    default:
      return errorMessage(`Blockchain with token ${currencySymbol} not supported`);
  }
  const rpcUrl4Irys: string | undefined = process.env.REACT_APP_IRYS_RPC_URL_DEV ?? '';
  if (!isMainnet && rpcUrl4Irys) {
    uploader.withRpc(rpcUrl4Irys).devnet();
  }
  return uploader;
};
