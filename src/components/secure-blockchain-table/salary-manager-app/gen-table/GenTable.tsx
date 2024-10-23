import { Stack, useTheme } from '@mui/material';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { CellEditRequestEvent, ColDef, GetRowIdParams, GridApi } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-theme-material.css'; // import material theme
import 'ag-grid-community/styles/ag-grid.css';
import Button from '@mui/material/Button';
import { useAppContext } from '../../../AppContextProvider';
import { StatusMessageElement } from '../../../common/StatusMessageElement';
import { errorMessage } from '../../../../types';

import '../gen-table/gen-table.css';
import { GenDataRow, GenTableDef, GenTableMode, ResizeMode, SaveDataRowFun, GenUpdateRowFun } from './gen-types';
import { applyColCollection, calcSumRows } from './sum-row-utils';
import { getResizeMode, getToggleState, saveResizeMode } from './gen-utils';
import { getGenColDef } from './gen-table-col-def';
import { GenDataRowDialog } from './GenDataRowDialog';
import { GenColumnSelection } from './GenColumnSelection';

type GenTableProps = {
  def: GenTableDef;
  dataRows: GenDataRow[];
  owner?: string;
  mode?: GenTableMode;
  height?: number;
  updateRow?: GenUpdateRowFun;
  saveRowDataToContract?: SaveDataRowFun;
};

export const GenTable: FC<GenTableProps> = ({
  def,
  dataRows,
  owner,
  updateRow,
  saveRowDataToContract,
  height = 10
}) => {
  const { web3Session } = useAppContext();

  const theme = useTheme();
  const [openAction, setOpenAction] = useState<GenDataRow>();
  const [toggleState, setToggleState] = useState<string[]>(getToggleState(''));

  const [gridApi, setGridApi] = useState<GridApi<GenDataRow>>();

  const getRowId = useCallback(({ data }: GetRowIdParams<GenDataRow>) => data.id.toString(), []);

  const selectionGroupMap = useMemo(() => {}, [def]);

  useEffect(() => {
    if (gridApi && toggleState) {
      applyColCollection(def, gridApi, toggleState);
    }
  }, [toggleState, gridApi, def]);

  // Apply settings across all columns
  const defaultColDef = useMemo<ColDef>(() => {
    return {
      filter: true,
      editable: true
    };
  }, []);
  const pinnedBottomRowData: GenDataRow[] = useMemo(
    () => (dataRows ? calcSumRows(def, dataRows) : []),
    [dataRows, def]
  );
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
      getGenColDef({
        def,
        setOpenAction,
        saveRowDataToContract
      }),
    [def, saveRowDataToContract]
  );

  if (!web3Session?.publicAddress) {
    return <StatusMessageElement statusMessage={errorMessage('Now Web3 Connection!')} />;
  }

  return (
    <Stack spacing={1}>
      <GenColumnSelection key={'column-selection'} setToggleState={setToggleState} toggleState={toggleState} />
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
          }: CellEditRequestEvent<GenDataRow>) => {
            if (oldValue === newValue) {
              return;
            }
            if (updateRow && field && typeof rowIndex === 'number') {
              updateRow('update', data.id.toString(), field as string, newValue);
            }
          }}
          // onCellClicked={(event: CellClickedEvent<GenDataRow>) => {
          //   const { column, data } = event;
          //   if ('dirty' === column.getColId()) {
          //     setOpenAction(data);
          //   }
          // }}
        />
      </div>
      {!!openAction && (
        <GenDataRowDialog data={openAction} done={() => setOpenAction(undefined)} owner={owner} action={updateRow} />
      )}
    </Stack>
  );
};
