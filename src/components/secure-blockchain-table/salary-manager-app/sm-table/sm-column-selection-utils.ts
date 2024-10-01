import { ColumnState, GridApi } from 'ag-grid-community';
import { ColumnSelection, ColumnSelectionName, ColumnSelectionState, SMDataRow, SMDataRowKeys } from './types';

const prevWork: SMDataRowKeys[] = ['prevPartTime', 'prevMonthsWorked', 'prevEmployeeFunction'];
const newWork: SMDataRowKeys[] = ['newPartTime', 'newMonthsWorked', 'newEmployeeFunction'];
const prevComp: SMDataRowKeys[] = [
  'prevFixed',
  'prevBonus',
  'prevCarAllowance',
  'prevMobileAllowance',
  'prevPensionFundPayment',
  'prevOther'
];
const newComp: SMDataRowKeys[] = [
  'newFixed',
  'newBonus',
  'newCarAllowance',
  'newMobileAllowance',
  'newPensionFundPayment',
  'newOther'
];
const summaries: SMDataRowKeys[] = ['prevCompTotal', 'newCompTotal', 'comparePercentage'];

export const initColumnSelection: ColumnSelection = {
  prevWork,
  newWork,
  prevComp,
  newComp,
  summaries
};

const allColumnNames = new Set<SMDataRowKeys>();
(Object.values(initColumnSelection) as SMDataRowKeys[][]).forEach((col) => col.forEach((e) => allColumnNames.add(e)));

export const applyColCollection = (gridApi: GridApi<SMDataRow>, toggleState: ColumnSelectionState) => {
  const set = new Set<SMDataRowKeys>();
  Object.entries(toggleState).forEach(([key, value]) => {
    const col: SMDataRowKeys[] | null = value ? initColumnSelection[key as ColumnSelectionName] : null;
    if (col !== null) {
      col.forEach((e) => set.add(e));
    }
  });

  const savedState = gridApi.getColumnState().map((c: ColumnState) => {
    const name = c.colId as SMDataRowKeys;
    let hide = c.hide;
    if (allColumnNames.has(name)) {
      hide = !set.has(name);
    }
    return {
      ...c,
      hide
    };
  });
  gridApi.applyColumnState({ state: savedState });
};
