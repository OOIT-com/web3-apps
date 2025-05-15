import { Stack, useTheme } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CellEditRequestEvent, ColDef, GetRowIdParams, GridApi } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-theme-material.css'; // import material theme
import 'ag-grid-community/styles/ag-grid.css';
import Button from '@mui/material/Button';
import { calcSumRows, getSMColDef } from './sm-table-col-def';
import { applyColCollection } from './sm-column-selection-utils';
import { ColumnSelectionName, ResizeMode, SMDataRow, SMDataRowUpdateableKeys, SMTableMode, ToggleState } from './types';
import { SMDataRowDialog } from './SMDataRowDialog';
import { useAppContext } from '../../../AppContextProvider';
import { StatusMessageElement } from '../../../common/StatusMessageElement';
import { getResizeMode, getToggleState, saveResizeMode } from './utils';

import './sm-table.css';
import { SMColumnSelection } from './SMColumnSelection';
import {errorMessage} from "../../../../utils/status-message";

export type UpdateRowFun = (
  cmd: 'update' | 'reset' | 'delete',
  userId: string,
  field: SMDataRowUpdateableKeys,
  value: any
) => void;

export type SaveDataRowFun = (dataRow: SMDataRow) => void;

export function SMTable({
  dataRows,
  prevYear,
  newYear,
  owner,
  updateRow,
  saveRowDataToContract,
  height = 10
}: Readonly<{
  dataRows: SMDataRow[];
  prevYear: number;
  newYear: number;
  owner?: string;
  mode?: SMTableMode;
  height?: number;
  updateRow?: UpdateRowFun;
  saveRowDataToContract?: SaveDataRowFun;
}>) {
  const { web3Session } = useAppContext();

  const theme = useTheme();
  const [openAction, setOpenAction] = useState<SMDataRow>();
  const [toggleState, setToggleState] = useState<Partial<ToggleState<ColumnSelectionName>>>(getToggleState(''));

  const [gridApi, setGridApi] = useState<GridApi<SMDataRow>>();

  const getRowId = useCallback(({ data }: GetRowIdParams<SMDataRow>) => data.userId, []);

  useEffect(() => {
    if (gridApi && toggleState) {
      applyColCollection(gridApi, toggleState);
    }
  }, [toggleState, gridApi]);

  // Apply settings across all columns
  const defaultColDef = useMemo<ColDef>(() => {
    return {
      filter: true,
      editable: true
    };
  }, []);
  const pinnedBottomRowData: SMDataRow[] = useMemo(() => (dataRows ? calcSumRows(dataRows) : []), [dataRows]);
  const [resizeMode, setResizeMode] = useState<ResizeMode>(getResizeMode('sm'));

  useEffect(() => {
    if (gridApi) {
      if (resizeMode === 'sizeToFit') {
        gridApi.sizeColumnsToFit();
      }
      if (resizeMode === 'autoSizeAll') {
        gridApi.autoSizeAllColumns();
      }
    }
  }, [gridApi, resizeMode]);

  const columnDefs = useMemo(
    () =>
      getSMColDef({
        prevYear,
        newYear,
        setOpenAction,
        saveRowDataToContract
      }),
    [prevYear, newYear, saveRowDataToContract, setOpenAction]
  );

  if (!web3Session?.publicAddress) {
    return <StatusMessageElement statusMessage={errorMessage('Now Web3 Connection!')} />;
  }

  return (
    <Stack spacing={1}>
      <SMColumnSelection
        key={'column-selection'}
        prevYear={prevYear}
        newYear={newYear}
        setToggleState={setToggleState}
        toggleState={toggleState}
      />
      <Stack key={'grid-options'} direction={'row'} justifyContent="space-between" alignItems="baseline">
        <Button
          onClick={() => {
            const newResizing = resizeMode === 'autoSizeAll' ? 'sizeToFit' : 'autoSizeAll';
            saveResizeMode(newResizing, 'sm');
            setResizeMode(newResizing);
          }}
        >
          Toggle Re-Sizing
        </Button>
      </Stack>
      <div
        className={theme.palette.mode === 'dark' ? 'ag-theme-material-dark' : 'ag-theme-material'}
        style={{ width: '100%', height: `${height}em` }}
      >
        <AgGridReact
          onGridReady={({ api }) => setGridApi(api)}
          // rowData={rowData}
          rowData={dataRows}
          pinnedBottomRowData={pinnedBottomRowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          stopEditingWhenCellsLoseFocus={true}
          readOnlyEdit={true}
          getRowId={getRowId}
          onCellEditRequest={({
            data,
            rowIndex,
            colDef: { field },
            oldValue,
            newValue
          }: CellEditRequestEvent<SMDataRow>) => {
            if (oldValue === newValue) {
              return;
            }
            if (updateRow && field && typeof rowIndex === 'number') {
              updateRow('update', data.userId, field as SMDataRowUpdateableKeys, newValue);
            }
          }}
        />
      </div>
      {!!openAction && (
        <SMDataRowDialog data={openAction} done={() => setOpenAction(undefined)} owner={owner} action={updateRow} />
      )}
    </Stack>
  );
}
