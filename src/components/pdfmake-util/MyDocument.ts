import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { NetworkInfo } from '../../types';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

export type UNSData = {
  name: string;
  blockchain: string;
  owner: string;
  contractAddress: string;
  networkInfo: NetworkInfo;
};

export const createUNSPdf = (data: UNSData) => {
  const { name, networkInfo, contractAddress, owner } = data;
  const docDefinition: TDocumentDefinitions = {
    content: [
      {
        text: 'Universal Naming Service',
        style: 'header'
      },
      `Name: ${name} `,
      `Blockchain: ${networkInfo.name} `,
      `Owner Address: ${owner} `,
      `Universal Naming Contract: ${contractAddress}`,

      {
        qr: contractAddress,
        fit: 500
      }
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true
      }
    }
  };

  pdfMake.createPdf(docDefinition).download(name + '.pdf');
};
