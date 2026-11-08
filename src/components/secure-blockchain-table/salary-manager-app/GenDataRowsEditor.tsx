import { DataRowEntry, SBTManager } from '../../../contracts/secure-blockchain-table/SecureBlockchainTable-support';
import { useAppContext } from '../../AppContextProvider';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { GenInitialData } from './types';
import { CollapsiblePanel } from '../../common/CollapsiblePanel';
import Button from '@mui/material/Button';
import { StatusMessageElement } from '../../common/StatusMessageElement';

import { GenTable } from './gen-table/GenTable';
import { GenDataRow, GenTableMode, GenUpdateRowFun, OperationalFields } from './gen-table/gen-types';
import { PRecord, PRecordCompatible } from '../../../ui-factory/types';
import {
  createUpdatedFieldsMap,
  mergeInitialDataAndRowData,
  mergeUnsavedDataRows,
  prepareUpdatableDataRow,
  readLatestDataRowsFromContract,
  saveRowData
} from './gen-table/gen-utils';
import { metadata } from './gen-table/metadata/metadata';
import { errorMessage, isStatusMessage, StatusMessage, warningMessage } from '../../../shared/status-message';
import { SBTMetaData } from '../sbt-types';

export function GenDataRowsEditor({
  sbtManager,
  initialData,
  metaData,
  mode = 'editable'
}: Readonly<{
  sbtManager: SBTManager;
  initialData: string;
  metaData: SBTMetaData;
  mode?: GenTableMode;
}>) {
  const { wrap } = useAppContext();
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [owner, setOwner] = useState('');
  const [dataRowEntries, setDataRowEntries] = useState<DataRowEntry<PRecord>[]>();
  const [dataRows, setDataRows] = useState<GenDataRow[]>([]);

  const def = metadata.def;

  const refreshRowDataFromContract = useCallback(async () => {
    setStatusMessage(undefined);
    if (!initialData || !def) {
      setStatusMessage(warningMessage(`No initial data found for ${sbtManager.name}!`));
      return;
    }
    let parseInitialData = {};
    try {
      parseInitialData = JSON.parse(initialData || '{}') as GenInitialData;
    } catch (e) {
      setStatusMessage(errorMessage((e as Error).message));
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
      const initialDataRows = mergeInitialDataAndRowData(
        def,
        (parseInitialData as GenInitialData).smTableRows,
        rowDataEntries0
      );

      // merge unsaved changes
      setDataRows((currentDataRows) => {
        const updatedFieldsMap = createUpdatedFieldsMap(def, currentDataRows);
        return mergeUnsavedDataRows({ def, initialDataRows, updatedFieldsMap });
      });
    }
  }, [def, initialData, sbtManager, wrap]);

  useEffect(() => {
    refreshRowDataFromContract().catch(console.error);
  }, [initialData, refreshRowDataFromContract]);

  const genUpdateRow: GenUpdateRowFun = useCallback(
    (cmd, userId, field, value) => {
      switch (cmd) {
        case 'update':
          console.debug('update', field, value);
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
      if (!sbtManager || !def) {
        return;
      }
      const updatableRow: PRecord = prepareUpdatableDataRow(def, dataRow);
      const res = await saveRowData({
        wrap,
        sbtManager,
        rowIndex: dataRow.operationalFields.rowIndex,
        updatableRow
      });
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
    [sbtManager, def, wrap, refreshRowDataFromContract]
  );

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

  const content: ReactNode[] = [
    <StatusMessageElement
      key={'status-message'}
      statusMessage={statusMessage}
      onClose={() => setStatusMessage(undefined)}
    />
  ];

  if (def) {
    content.push(
      <GenTable
        key={`gen-table`}
        def={def}
        dataRows={genDataRows}
        height={40}
        owner={owner}
        updateRow={genUpdateRow}
        saveRowDataToContract={saveRowDataToContract}
      />
    );
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
      content={content}
    />
  );
}
