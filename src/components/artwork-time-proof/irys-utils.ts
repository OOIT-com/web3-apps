import { fileTypeFromBuffer } from 'file-type';
import Query from '@irys/query';

export const contentType = async (buffer: Buffer, filename: string): Promise<string> => {
  const type = await fileTypeFromBuffer(buffer);
  return type ? type.mime : 'application/octet-stream'; // Default to unknown type
};

export const getMetaData = async (id: string) => {
  const parts = id.split('/');
  const lastPart = parts[parts.length - 1];

  const myQuery = new Query();

  return await myQuery.search('irys:transactions').ids([lastPart]);
};
