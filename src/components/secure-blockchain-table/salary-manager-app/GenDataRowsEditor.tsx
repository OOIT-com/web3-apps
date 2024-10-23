import { DataRowEntry, SBTManager } from '../../../contracts/secure-blockchain-table/SecureBlockchainTable-support';
import { useAppContext } from '../../AppContextProvider';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { GenInitialData } from './types';
import { isStatusMessage, StatusMessage, warningMessage } from '../../../types';
import { CollapsiblePanel } from '../../common/CollapsiblePanel';
import Button from '@mui/material/Button';
import { StatusMessageElement } from '../../common/StatusMessageElement';

import { GenTable } from './gen-table/GenTable';
import {
  GenDataRow,
  GenTableDef,
  GenTableMode,
  GenUpdatableDataRow,
  GenUpdateRowFun,
  OperationalFields
} from './gen-table/gen-types';
import { PRecord, PRecordCompatible } from '../../../ui-factory/types';
import { calcSumRows, genApplyUpdateCellEvent } from './gen-table/sum-row-utils';
import {
  createUpdatedFieldsMap,
  mergeInitialDataAndRowData,
  mergeUnsavedDataRows,
  prepareUpdatableDataRow,
  readLatestDataRowsFromContract,
  saveRowData
} from './gen-table/gen-utils';
import { updateCompensationComparisons } from './gen-table/gen-table-col-def';

export function GenDataRowsEditor({
  def,
  sbtManager,
  initialData,
  mode = 'editable'
}: Readonly<{
  def: GenTableDef;
  sbtManager: SBTManager;
  initialData: GenInitialData;
  mode?: GenTableMode;
}>) {
  const { wrap } = useAppContext();
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [owner, setOwner] = useState('');
  const [dataRowEntries, setDataRowEntries] = useState<DataRowEntry<GenUpdatableDataRow>[]>();
  const [dataRows, setDataRows] = useState<GenDataRow[]>([]);
  const [dirty, setDirty] = useState(false);

  const refreshRowDataFromContract = useCallback(async () => {
    setStatusMessage(undefined);
    if (!initialData) {
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
      const initialDataRows = mergeInitialDataAndRowData(initialData.rows, rowDataEntries0);

      // merge unsaved changes
      setDataRows((currentDataRows) => {
        const updatedFieldsMap = createUpdatedFieldsMap(currentDataRows);
        return mergeUnsavedDataRows({ initialDataRows, updatedFieldsMap });
      });
    }
  }, [wrap, sbtManager, initialData, setDataRowEntries, setDataRows]);

  useEffect(() => {
    refreshRowDataFromContract().catch(console.error);
  }, [initialData, refreshRowDataFromContract]);

  const updateRow: GenUpdateRowFun = useCallback(
    (cmd, id, field, value) => {
      switch (cmd) {
        case 'update':
          setDataRows((dataRows) => genApplyUpdateCellEvent(dataRows, { id, field, value }));
          break;
        case 'reset':
          setDataRows((dataRows0) =>
            dataRows0.map((dataRow) => {
              const dataRow0 = { ...dataRow };
              if (dataRow0.id === id && dataRow0.updatedFields) {
                delete dataRow0.updatedFields;
              }
              return dataRow0;
            })
          );
      }
    },
    [setDataRows]
  );

  const genUpdateRow: GenUpdateRowFun = useCallback(
    (cmd, userId, field, value) => {
      switch (cmd) {
        case 'update':
          //setDataRows((dataRows) => genApplyUpdateCellEvent(dataRows, { userId, field, value }));
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
    async (dataRow: GenDataRow) => {
      if (!sbtManager) {
        return;
      }
      const updatableRow: PRecord = prepareUpdatableDataRow(def, dataRow);
      const res = await saveRowData({ wrap, sbtManager, rowIndex: dataRow.operationalFields.rowIndex, updatableRow });
      if (isStatusMessage(res)) {
        setStatusMessage(res);
        return;
      } else {
        setDataRows((dataRows0) =>
          dataRows0.map(
            (dataRow0) => dataRow0
            // dataRow0.id === dataRow.id
            //   ? {
            //       ...dataRow,
            //       operationalFields: { ...dataRow.operationalFields, updatedFields: undefined }
            //     }
            //   : dataRow0
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
      dataRow0 = JSON.parse(JSON.stringify(dataRow0));
      dataRow0 = updateCompensationComparisons(dataRow0);
      return dataRow0;
    });
    calcSumRows(def, newDataRows);
    setDirty(dirty);
    return newDataRows;
  }, [dataRows]);

  const genDataRows: GenDataRow[] = useMemo(() => {
    const getDataRows: GenDataRow[] = dataRows.map((dr) => {
      const operationalFields: OperationalFields = {
        rowIndex: dr.operationalFields.rowIndex,
        created: dr.operationalFields.created,
        userAddress: dr.operationalFields.userAddress,
        dirty: false,
        version: dr.operationalFields.version
      };
      const dpr: PRecord = { ...(dr as PRecordCompatible<GenDataRow>) };
      dpr.id = dr.userId;
      return { ...dpr, operationalFields } as GenDataRow;
    });
    return getDataRows;
  }, [dataRows]);

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

        <GenTable
          key={`gen-table`}
          def={def}
          dataRows={genDataRows}
          height={40}
          mode={mode}
          owner={owner}
          updateRow={genUpdateRow}
          saveRowDataToContract={saveRowDataToContract}
        />
      ]}
    />
  );
}
