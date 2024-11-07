import { DataRowEntry, SBTManager } from '../../../contracts/secure-blockchain-table/SecureBlockchainTable-support';
import { useAppContext } from '../../AppContextProvider';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { errorMessage, isStatusMessage, StatusMessage, warningMessage } from '../../../types';
import { CollapsiblePanel } from '../../common/CollapsiblePanel';
import Button from '@mui/material/Button';
import { StatusMessageElement } from '../../common/StatusMessageElement';
import { SMDataRow, SMTableMode, SMUpdatableDataRow } from './sm-table/types';
import { SMTable, UpdateRowFun } from './sm-table/SMTable';
import {
  applyUpdateCellEvent,
  createUpdatedFieldsMap,
  mergeInitialDataAndRowData,
  mergeUnsavedDataRows,
  prepareUpdatableDataRow,
  readLatestDataRowsFromContract,
  saveRowData
} from './sm-app-utils';
import { calcSumRows, updateCompensationComparisons } from './sm-table/sm-table-col-def';
import { SMInitialData } from './types';

export function SalaryManagerDataRowsEditor({
  sbtManager,
  initialData,
  mode = 'editable'
}: Readonly<{
  sbtManager: SBTManager;
  initialData: string;
  mode?: SMTableMode;
}>) {
  const { wrap } = useAppContext();
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [owner, setOwner] = useState('');
  const [dataRowEntries, setDataRowEntries] = useState<DataRowEntry<SMUpdatableDataRow>[]>();
  const [dataRows, setDataRows] = useState<SMDataRow[]>([]);
  const [dirty, setDirty] = useState(false);
  const [parsedInitialData, setParsedInitialData] = useState<SMInitialData>();

  useEffect(() => {
    if (initialData) {
      setParsedInitialData(JSON.parse(initialData));
    }
  }, [initialData]);
  const refreshRowDataFromContract = useCallback(async () => {
    setStatusMessage(undefined);
    if (!parsedInitialData) {
      setStatusMessage(warningMessage(`No initial data found for ${sbtManager.name}!`));
      return;
    }

    // owner
    const owner = await sbtManager.owb.owner();
    if (isStatusMessage(owner)) {
      setStatusMessage(owner);
    } else {
      setOwner(owner);
    }

    const rowDataEntries0 = await readLatestDataRowsFromContract(wrap, sbtManager);
    if (isStatusMessage(rowDataEntries0)) {
      setStatusMessage(rowDataEntries0);
    } else {
      setDataRowEntries(rowDataEntries0);
      const initialDataRows = mergeInitialDataAndRowData(parsedInitialData.smTableRows, rowDataEntries0);

      // merge unsaved changes
      setDataRows((currentDataRows) => {
        const updatedFieldsMap = createUpdatedFieldsMap(currentDataRows);
        return mergeUnsavedDataRows({ initialDataRows, updatedFieldsMap });
      });
    }
  }, [parsedInitialData, sbtManager, wrap]);

  useEffect(() => {
    refreshRowDataFromContract().catch(console.error);
  }, [initialData, refreshRowDataFromContract]);

  const updateRow: UpdateRowFun = useCallback(
    (cmd, userId, field, value) => {
      switch (cmd) {
        case 'update':
          setDataRows((dataRows) => applyUpdateCellEvent(dataRows, { userId, field, value }));
          break;
        case 'reset':
          setDataRows((dataRows0) =>
            dataRows0.map((dataRow) => {
              const dataRow0 = { ...dataRow };
              if (dataRow0.userId === userId && dataRow0.updatedFields) {
                delete dataRow0.updatedFields;
              }
              return dataRow0;
            })
          );
      }
    },
    [setDataRows]
  );

  const saveRowDataToContract = useCallback(
    async (dataRow: SMDataRow) => {
      if (!sbtManager) {
        return;
      }
      const updatableDataRow: SMUpdatableDataRow = prepareUpdatableDataRow(dataRow);
      const res = await saveRowData(wrap, sbtManager, updatableDataRow);
      if (isStatusMessage(res)) {
        setStatusMessage(res);
        return;
      } else {
        setDataRows((dataRows0) =>
          dataRows0.map((dataRow0) =>
            dataRow0.userId === dataRow.userId
              ? {
                  ...dataRow,
                  updatedFields: undefined
                }
              : dataRow0
          )
        );
      }
      await refreshRowDataFromContract();
    },
    [sbtManager, refreshRowDataFromContract, wrap]
  );

  const editableDataRows = useMemo(() => {
    let dirty = false;
    const newDataRows = dataRows.map((dataRow0) => {
      if (dataRow0.updatedFields) {
        dirty = true;
      }
      dataRow0 = { ...dataRow0, ...dataRow0.updatedFields };
      dataRow0 = updateCompensationComparisons(dataRow0);
      return dataRow0;
    });
    calcSumRows(newDataRows);
    setDirty(dirty);
    return newDataRows;
  }, [dataRows]);

  if (!parsedInitialData) {
    return <StatusMessageElement statusMessage={errorMessage('Data loading...')}></StatusMessageElement>;
  }

  return (
    <CollapsiblePanel
      level={'second'}
      title={'Data Row Editor'}
      collapsible={true}
      collapsed={false}
      toolbar={[
        <Button key={'load-data'} onClick={() => refreshRowDataFromContract()}>
          Refresh from Contract
        </Button>,
        <Button
          disabled={!dirty}
          key={'save-rows'}
          onClick={() => {
            setStatusMessage(undefined);
            const res = wrap('Save Row Data...', async () => {
              const data = JSON.stringify(dataRowEntries);

              const encData = await sbtManager.encryptContent(data);
              if (isStatusMessage(encData)) {
                return encData;
              }
              const res = await sbtManager.setInitialData(encData);
              if (isStatusMessage(res)) {
                return res;
              }
            });
            if (isStatusMessage(res)) {
              setStatusMessage(res);
            }
          }}
        >
          Save Data
        </Button>
      ]}
      content={[
        <StatusMessageElement
          key={'status-message'}
          statusMessage={statusMessage}
          onClose={() => setStatusMessage(undefined)}
        />,
        <SMTable
          key={`sm-table+${dataRows.length}`}
          dataRows={editableDataRows}
          newYear={parsedInitialData.newYear}
          prevYear={parsedInitialData.prevYear}
          height={40}
          mode={mode}
          owner={owner}
          updateRow={updateRow}
          saveRowDataToContract={saveRowDataToContract}
        />
      ]}
    />
  );
}
