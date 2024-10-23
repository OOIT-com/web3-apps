import { CellClassRules, ColDef } from 'ag-grid-community';
import { CustomCellRendererProps } from 'ag-grid-react';
import { Stack } from '@mui/material';
import Button from '@mui/material/Button';
import { Fragment } from 'react';
import { PValue } from '../../../../ui-factory/types';
import { GenAttStyle, GenAttType, GenDataRow, GenTableDef, SaveDataRowFun } from './gen-types';
import { templateRow } from './sum-row-utils';
import humanizeString from 'humanize-string';

type CellStyleParts = { style: GenAttStyle; editable: boolean; type: GenAttType };
const createCellClass = ({ style, editable, type }: CellStyleParts) =>
  `sm-${style || 'normal'}-${editable ? 'editable' : 'readonly'}-${type}`;

type HeaderNameParts = { name: string };
const createHeaderName = ({ name }: HeaderNameParts) => humanizeString(name);

const cellClassRules: CellClassRules<GenDataRow> = {
  // apply green to 2008
  'sm-cell-dirty': ({ data, column }) => {
    const field = column.getColId() || '';
    const ups = data?.operationalFields;
    const u = (ups?.updatedFields || {})[field];
    return u !== undefined && u !== null;
  },
  'sm-cell-readonly': ({ column, node }) => {
    return !column.isCellEditable(node);
  }
};
export const getGenColDef = ({
  def,
  setOpenAction,
  saveRowDataToContract
}: {
  def: GenTableDef;
  setOpenAction?: (data: GenDataRow) => void;
  saveRowDataToContract?: SaveDataRowFun;
}): ColDef<GenDataRow>[] => {
  const mainEditable = !!(setOpenAction && saveRowDataToContract);
  const columns: ColDef<GenDataRow>[] = [];
  def.attributes.forEach(
    ({ name, visible = true, editable = true, type = 'string', style = 'normal', formatter, cellStyle = {} }) => {
      editable = editable && mainEditable;
      if (visible) {
        const cellClass = createCellClass({ style, editable, type });
        const headerName = createHeaderName({ name });
        const singleClickEdit = editable;
        const valueFormatter = undefined; //formatter?getFormatterFun(formatter):undefined

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
      cellRenderer: ({ data }: CustomCellRendererProps<GenDataRow>) => {
        if (!data || data?.userId === 'sum-row') {
          return <Fragment key={'emtpy'} />;
        } else {
          return (
            <Stack direction={'row'} key={'editable'}>
              <Button
                key={'save'}
                disabled={!data.operationalFields}
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
const toNum = (v: PValue): number => (typeof v === 'boolean' ? 0 : +v);

const calcPrevCompTotal = ({
  prevFixed,
  prevBonus,
  prevCarAllowance,
  prevMobileAllowance,
  prevPensionFundPayment,
  prevOther
}: GenDataRow) =>
  toNum(prevFixed) +
  toNum(prevBonus) +
  toNum(prevCarAllowance) +
  toNum(prevMobileAllowance) +
  toNum(prevPensionFundPayment) +
  toNum(prevOther);

const calcNewCompTotal = ({
  newFixed,
  newBonus,
  newCarAllowance,
  newMobileAllowance,
  newPensionFundPayment,
  newOther
}: GenDataRow) =>
  toNum(newFixed) +
  toNum(newBonus) +
  toNum(newCarAllowance) +
  toNum(newMobileAllowance) +
  toNum(newPensionFundPayment) +
  toNum(newOther);

export const updateCompensationComparisons = (dataRow: GenDataRow): GenDataRow => {
  const prevCompTotal = calcPrevCompTotal(dataRow);
  const newCompTotal = calcNewCompTotal(dataRow);
  const comparePercentage = prevCompTotal === 0 ? 0 : (newCompTotal - prevCompTotal) / prevCompTotal;
  // , prevCompTotal, newCompTotal, comparePercentage
  const newDataRow: GenDataRow = { ...dataRow };
  newDataRow.prevCompTotal = prevCompTotal;
  newDataRow.newCompTotal = newCompTotal;
  newDataRow.comparePercentage = comparePercentage;
  return newDataRow;
};

// old * (1+per) = new
// old + old*per = new
// old*per = new - old
// per = (new-old)/old
