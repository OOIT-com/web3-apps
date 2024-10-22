import { SMDataRow } from '../sm-table/types';
import { GenAttributeDef, GenAttType, GenTableDef } from './gen-types';
import { IdValue, PRecord, PValue } from '../../../../ui-factory/types';

export const resolveType = (att: GenAttributeDef): GenAttType => att.type || 'string';
export const defaultByType = (genType?: GenAttType): PValue =>
  genType === 'number' ? 0 : genType === 'boolean' ? false : '';

export const resolveDefault = (att: GenAttributeDef, defaultValue: PValue): PValue => {
  const type = resolveType(att);
  if (typeof defaultValue === type) {
    return defaultValue;
  }
  if (att.defaultValue !== undefined && typeof att.defaultValue === type) {
    return att.defaultValue;
  }
  return defaultByType(type);
};

export const templateRow = (def: GenTableDef, id: IdValue): PRecord =>
  def.attributes.reduce((acc, att) => {
    if (att.name === 'id') {
      acc[att.name] = resolveDefault(att, id);
    } else {
      acc[att.name] = defaultByType(att.type);
    }
    return acc;
  }, {} as PRecord);

export const calcSumRows = (getTableDef: GenTableDef, dataTable: PRecord[]): PRecord[] => {
  let sumRowResult = templateRow(getTableDef, 'sum-row');
  dataTable.forEach((row, index) => {
    getTableDef.attributes.forEach(({ name, type, sumRow = 'sum' }) => {
      if (type === 'number' && typeof sumRowResult[name] === 'number' && typeof row[name] === 'number') {
        if (sumRow === 'sum') {
          // @ts-ignore
          sumRowResult[name] += row[name];
        } else if (sumRow === 'average') {
          const currentAverage = sumRowResult[name];
          // @ts-ignore
          sumRowResult[name] = (currentAverage * index + row[name]) / (index + 1);
        }
      }
    });
  });
  return [sumRowResult];
};
