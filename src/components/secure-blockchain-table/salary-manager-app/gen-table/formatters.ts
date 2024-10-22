import { FormatterDic } from './gen-types';
import { PValue } from '../../../../ui-factory/types';

export const formatters: FormatterDic = {
  percentage: (value: PValue) => (typeof value === 'number' ? `${Math.round(value * 100)} %` : value.toString())
};
