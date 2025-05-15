import { IrysAccess } from './IrysAccess';

import {errorMessage, infoMessage, isStatusMessage, StatusMessage} from "./status-message";

export const IRYS_GATEWAY = process.env.REACT_APP_IRYS_GATEWAY;

export const downloadLink = (id?: string) => IRYS_GATEWAY + (id ?? '');
export type IrysData = {
  polygonBalance: string;
  address: string;
  balance: string;
  pricePerMega: string;
  uploadableMegabytes: number;
};

export async function loadIrysData(irysAccess: IrysAccess): Promise<
  IrysData & {
    statusMessage: StatusMessage;
  }
> {
  const address = irysAccess.web3Session.publicAddress;
  try {
    let statusMessage: StatusMessage = infoMessage('Ok');
    const balance = (await irysAccess.getBalance(address)).toString();
    const pricePerMega = (await irysAccess.getPrice(1024 * 1024)).toString();
    let polygonBalance = '0';
    console.log('getPolygonBalance', polygonBalance);
    polygonBalance = (await irysAccess.web3Session.web3.eth.getBalance(address)).toString();

    if (isStatusMessage(polygonBalance)) {
      statusMessage = polygonBalance;
      polygonBalance = '0';
    }

    const uploadableMegabytes = Math.floor((100 * +balance) / +pricePerMega) / 100;

    return { polygonBalance, balance, statusMessage, address, pricePerMega, uploadableMegabytes };
  } catch (e) {
    return {
      statusMessage: errorMessage('Irys Data loading failed', e),
      polygonBalance: '0',
      balance: '0',
      address,
      pricePerMega: '0',
      uploadableMegabytes: 0
    };
  }
}
