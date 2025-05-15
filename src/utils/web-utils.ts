import { errorMessage, StatusMessage } from './status-message';

export const fetchAsUint8Array = async (link: string): Promise<Uint8Array | StatusMessage> => {
  try {
    const response = await fetch(link);
    if (!response.ok) {
      return errorMessage(`Failed to fetch artwork data: ${response.statusText}`);
    }
    return new Uint8Array(await response.arrayBuffer());
  } catch (error) {
    return errorMessage(`Error downloading data from ${link}:`, error);
  }
};

export function resolveFileType(filename = ''): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'json':
      return 'application/json';
    case 'txt':
      return 'text/plain';
    case 'jpg':
    case 'jp2':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
}
