import JSZip from 'jszip';

export type ZipEntry = { folder?: string; name: string; data: Buffer };
export const createZip = async (zipEntries: ZipEntry[]): Promise<Buffer> => {
  const zip = new JSZip();
  for (const { folder, name, data } of zipEntries) {
    if (folder) {
      zip.folder(folder);
    }
    zip.file(name, data);
  }

  return await zip.generateAsync({ type: 'nodebuffer' });
};
