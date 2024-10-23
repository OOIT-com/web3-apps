import { FormatterDic, FormatterFun } from './gen-types';
import { PRecord, PValue } from '../../../../ui-factory/types';

export const formatters: FormatterDic = {
  percentage: (value: PValue | PRecord) =>
    typeof value === 'number' ? `${Math.round(value * 100)} %` : value.toString()
};

const idFun = (value: PValue) => value.toString();

export const getFormatterFun = (name: string): FormatterFun => {
  const f = formatters[name];
  return f || idFun;
};
