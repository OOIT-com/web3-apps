import { DecryptFun } from '../login/connect-with-localstore';
import { Buffer } from 'buffer';

import { base64ToJson } from '../../utils/enc-dec-utils';

export const decryptKeyBlockValue = async (value: string, decryptFun?: DecryptFun) => {
  if (!decryptFun) {
    return null;
  }
  let s1: any = null;
  const buff1 = Buffer.from(value, 'base64');
  const inArray = new Uint8Array(buff1);
  const outArray = await decryptFun(inArray);
  if (outArray) {
    const content64 = Buffer.from(outArray).toString();
    s1 = base64ToJson(content64);
  }
  return s1;
};
