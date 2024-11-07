import { GenAttributeDef, GenAttType, GenDataRow, GenTableDef } from './gen-types';
import { IdValue, PValue } from '../../../../ui-factory/types';
import { ColumnState, GridApi } from 'ag-grid-community';
import { resolveId } from './gen-utils';

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

export const templateRow = (def: GenTableDef, idValue: IdValue): GenDataRow =>
  def.attributes.reduce((acc, att) => {
    const idName = def.idName;
    if (att.name === idName) {
      acc[att.name] = resolveDefault(att, idValue);
    } else {
      acc[att.name] = defaultByType(att.type);
    }
    return acc;
  }, {} as GenDataRow);

export const calcSumRows = (getTableDef: GenTableDef, dataTable: GenDataRow[]): GenDataRow[] => {
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

export type SelectionGroups = Record<string, string[] | null>;

export const initColumnSelection = (def: GenTableDef): SelectionGroups => {
  const selectionGroup: SelectionGroups = {};
  def.attributes.forEach((att) => {
    (att.selectionGroups || []).forEach((g) => {
      const group = selectionGroup[g] || [];
      if (!group.includes(att.name)) {
        group.push(att.name);
      }
      selectionGroup[g] = group;
    });
  });

  return selectionGroup;
};

export const applyColCollection = (def: GenTableDef, gridApi: GridApi<GenDataRow>, toggleState: string[]) => {
  const selGr = initColumnSelection(def);

  const savedState = gridApi.getColumnState().map((c: ColumnState) => {
    const name = c.colId;
    const att = def.attributes.find((att) => att.name === name);
    const attName = att?.name;
    if (attName) {
      for (const tsName of toggleState) {
        if (selGr[tsName]?.includes(attName)) {
          return {
            ...c,
            hide: false
          };
        }
      }
    }
    return {
      ...c,
      hide: false
    };
  });
  gridApi.applyColumnState({ state: savedState });
};

export const genApplyUpdateCellEvent = (
  dataRows: GenDataRow[],
  {
    def,
    idValue,
    field,
    value
  }: {
    def: GenTableDef;
    idValue: IdValue;
    field: string;
    value: any;
  }
): GenDataRow[] =>
  dataRows.map((dataRow) => {
    if (resolveId(def, dataRow) === idValue) {
      const newDataRow = { ...dataRow };
      const sameValue = newDataRow[field] === value;
      if (newDataRow.operationalFields.updatedFields && sameValue) {
        delete newDataRow.operationalFields.updatedFields[field];
        if (Object.keys(newDataRow.operationalFields.updatedFields).length === 0) {
          delete newDataRow.updatedFields;
        }
      } else if (!sameValue) {
        newDataRow.operationalFields.updatedFields = {
          ...(newDataRow.operationalFields.updatedFields || {}),
          [field]: value
        };
      }
      return newDataRow;
    }
    return dataRow;
  });
