import { CellClassRules, ColDef, ValueFormatterParams } from 'ag-grid-community';
import { AttStyle, AttType, SMDataRow, SMDataRowKeys, SMDataRowUpdateableKeys, smTableRowAttributes } from './types';
import { CustomCellRendererProps } from 'ag-grid-react';
import { templateRow } from './utils';
import { Stack } from '@mui/material';
import Button from '@mui/material/Button';
import { SaveDataRowFun } from './SMTable';
import { Fragment } from 'react';

type CellStyleParts = { style: AttStyle; editable: boolean; type: AttType };
const createCellClass = ({ style, editable, type }: CellStyleParts) =>
  `sm-${style || 'normal'}-${editable ? 'editable' : 'readonly'}-${type}`;

type HeaderNameParts = { name: SMDataRowKeys; prevYear: number; newYear: number };
const createHeaderName = ({ name, prevYear, newYear }: HeaderNameParts) => {
  if (name.startsWith('prev')) {
    return `${prevYear} ${name.substring(4, 5).toUpperCase()}${name.substring(5)}`;
  }
  if (name.startsWith('new')) {
    return `${newYear} ${name.substring(3, 4).toUpperCase()}${name.substring(4)}`;
  }
};

const cellClassRules: CellClassRules<SMDataRow> = {
  // apply green to 2008
  'sm-cell-dirty': ({ data, column }) => {
    const field = (column.getColId() || '') as SMDataRowUpdateableKeys;
    const ups = data?.updatedFields || {};
    const u = ups[field];
    return u !== undefined && u !== null;
  },
  'sm-cell-readonly': ({ column, node }) => {
    return !column.isCellEditable(node);
  }
};
export const getSMColDef = ({
  prevYear,
  newYear,
  setOpenAction,
  saveRowDataToContract
}: {
  prevYear: number;
  newYear: number;
  setOpenAction?: (data: SMDataRow) => void;
  saveRowDataToContract?: SaveDataRowFun;
}): ColDef<SMDataRow>[] => {
  const mainEditable = !!(setOpenAction && saveRowDataToContract);
  const columns: ColDef<SMDataRow>[] = [];
  smTableRowAttributes.forEach(
    ({ name, visible = true, editable = true, type = 'text', style = 'normal', formatter, cellStyle = {} }) => {
      editable = editable && mainEditable;
      if (visible) {
        const cellClass = createCellClass({ style, editable, type });
        const headerName = createHeaderName({ name, prevYear, newYear });
        const singleClickEdit = editable;
        const valueFormatter = formatter
          ? ({ value, data }: ValueFormatterParams<SMDataRow>) => formatter(value, data)
          : undefined;

        columns.push({
          field: name,
          headerName,
          filter: true,
          suppressSizeToFit: false,
          resizable: true,
          flex: 1,
          type,
          editable,
          cellClass,
          cellClassRules,
          minWidth: 120,
          singleClickEdit,
          valueFormatter,
          ...cellStyle
        });
      }
    }
  );

  if (mainEditable) {
    columns.push({
      headerName: 'Action',
      editable: false,
      pinned: 'right',
      suppressSizeToFit: true,
      resizable: false,
      cellRenderer: ({ data }: CustomCellRendererProps<SMDataRow>) => {
        if (!data || data?.userId === 'sum-row') {
          return <Fragment key={'emtpy'} />;
        } else {
          return (
            <Stack direction={'row'} key={'editable'}>
              <Button
                key={'save'}
                disabled={!data.updatedFields}
                size={'small'}
                onClick={() => saveRowDataToContract(data)}
              >
                save
              </Button>
              <Button key={'more'} size={'small'} onClick={() => setOpenAction(data)}>
                more...
              </Button>
            </Stack>
          );
        }
      }
    });
  }
  return columns;
};

const calcPrevCompTotal = ({
  prevFixed,
  prevBonus,
  prevCarAllowance,
  prevMobileAllowance,
  prevPensionFundPayment,
  prevOther
}: SMDataRow) => prevFixed + prevBonus + prevCarAllowance + prevMobileAllowance + prevPensionFundPayment + prevOther;

const calcNewCompTotal = ({
  newFixed,
  newBonus,
  newCarAllowance,
  newMobileAllowance,
  newPensionFundPayment,
  newOther
}: SMDataRow) => newFixed + newBonus + newCarAllowance + newMobileAllowance + newPensionFundPayment + newOther;

export const updateCompensationComparisons = (dataRow: SMDataRow): SMDataRow => {
  const prevCompTotal = calcPrevCompTotal(dataRow);
  const newCompTotal = calcNewCompTotal(dataRow);
  const comparePercentage = prevCompTotal === 0 ? 0 : (newCompTotal - prevCompTotal) / prevCompTotal;
  return { ...dataRow, prevCompTotal, newCompTotal, comparePercentage };
};

// old * (1+per) = new
// old + old*per = new
// old*per = new - old
// per = (new-old)/old

export const calcSumRows = (smTableRows: SMDataRow[]): SMDataRow[] => {
  let sumRowResult = templateRow('sum-row');
  smTableRows.forEach((row, index) => {
    smTableRowAttributes.forEach(({ name, type, sumRow = 'sum' }) => {
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
