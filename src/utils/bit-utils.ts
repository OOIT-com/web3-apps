export const zero32 = '0x00000000000000000000000000000000';
export const maxHex = 16 * 2;
export const maxBin = maxHex * 4;

export const zero128: string[] = new Array(128).fill('0');
export const zero128s: string = zero128.join('');
export const zero32s: string = [...(zero32.substring(2))].join('');
export const fill128 = (bin: string): string[] => [...zero128s.substring(0, 128 - bin.length), ...bin];
export const fillHex32 = (hex: string): string => [...zero32s.substring(0, 32 - hex.length), ...hex].join('');

export function to0x16(n: BigInt) {
  const hex1 = n.toString(16);
  if (hex1.length > 32) {
    throw Error(`Number to large ${n.toString(16)}. Max; 16 bytes`);
  }
  const prefix = zero32.substring(0, 34 - hex1.length);
  return prefix + hex1;
}

export function from0x16(s: string) {
  if (s.length != 34) {
    throw Error(`Wrong format ${s}. 0x...32... expected`);
  }
  return BigInt(s);
}

export function to(n: number) {
  return BigInt(n);
}

export const to128Array = (hex0x: string) => fill128(BigInt(hex0x).toString(2));

export function checkHex0x(hex0x: string) {
  return (
    hex0x.length === 2 + maxHex &&
    hex0x.startsWith('0x') &&
    to128Array(hex0x).length === 128 &&
    to128Array(hex0x).reduce((a, c) => a && (c === '0' || c === '1'), true)
  );
}

export function set(hex0x: string, index: number, v: boolean) {
  if (checkHex0x(hex0x)) {
    const b = to128Array(hex0x);
    b[index] = v ? '1' : '0';
    const bs = '0b' + b.join('');
    return '0x' + fillHex32(BigInt(bs).toString(16));
  }
  throw Error(`Unknown format: ${hex0x}`);
}

export function new128(indexes: number[]) {
  const b = to128Array(zero32);
  indexes.forEach((index) => (b[index] = '1'));
  return '0x' + fillHex32(BigInt('0b' + b.join('')).toString(16));
}

export function has(hex0x: string, index: number) {
  const n = BigInt(hex0x);
  const b = fill128(n.toString(2));
  return b[index] === '1';
}
