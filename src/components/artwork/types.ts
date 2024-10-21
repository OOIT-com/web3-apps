export type EncryptionType = 'no-encryption' | 'use-public-key-store-v2' | 'new-key-pair';
export type MetaData = {
  filename: string;
  artworkName: string;
  artworkDescription: string;
  artworkAuthor: string;
  contentHash: string;
  filedate: string;
  filemime: string;
  filesize: number;
  dataHash: string;
  encryptionKey: string;
  encryptionKeyLocation: string;
  encryptionMethod: string;
  encryptionAlgorithm: string;
  [key: string]: string | number;
};

export type UploadInfo = Partial<MetaData> & {
  uploadId?: string;
  timestamp?: string;
};
