export function display64(s: string, max = 9): string {
  if (!s || s.length < max || max === 0) {
    return s;
  }
  return `${s.substring(0, max / 2)}...${s.substring(s.length - max / 2)} (size: ${s.length})`;
}

export function displayAddress(s: string, isXs = false): string {
  try {
    if (isXs) {
      return s.substring(s.length - 4);
    }
    return s.substring(0, 5) + '...' + s.substring(s.length - 4);
  } catch (e) {
    return s;
  }
}

export async function file2string(file: Blob | string): Promise<string> {
  if (typeof file === 'string') {
    return file;
  }
  const arrayBuffer = await file.arrayBuffer();
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(arrayBuffer);
}

export const isWhitespace = (character: string) => /\s/.test(character);
const specialChars = '><:\\?*';

export const safeFilename = (filename: string) => {
  let fn = '';
  for (const s of filename) {
    if (isWhitespace(s) || specialChars.includes(s)) {
      fn = `${fn}_`;
      continue;
    }
    fn = `${fn}${s}`;
  }
  return fn;
};
