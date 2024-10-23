import { GenDataRow, GenTableDef, GenUpdatableDataRow, ResizeMode } from './gen-types';
import { WrapFun } from '../../../AppContextProvider';
import { DataRowEntry, SBTManager } from '../../../../contracts/secure-blockchain-table/SecureBlockchainTable-support';
import { isStatusMessage, StatusMessage } from '../../../../types';
import { IdValue, PRecord, PValue } from '../../../../ui-factory/types';
import {
  SMDataRow,
  SMDataRowKeys,
  SMDataRowUpdateableKeys,
  SMUpdatableDataRow,
  UpdatedFieldsMap
} from '../sm-table/types';

const toggleStatePrefix = '__gen_toggleState_';
export const getToggleState = (key: string): string[] => {
  const k = `${toggleStatePrefix}${key}`;
  const s = localStorage.getItem(k);
  return JSON.parse(s ?? '[]') as string[];
};

export const saveToggleState = (toggleState: string[], key: string) => {
  const k = `${toggleStatePrefix}${key}`;
  localStorage.setItem(k, JSON.stringify(toggleState));
};

const resizeModePrefix = '__list_page_resizeMode_';

export const getResizeMode = (key: string): ResizeMode => {
  const k = `${resizeModePrefix}${key}`;
  return (localStorage.getItem(k) as ResizeMode) || 'sizeToFit';
};
export const saveResizeMode = (resizeMode: ResizeMode, key: string) => {
  const k = `${resizeModePrefix}${key}`;
  localStorage.setItem(k, resizeMode);
};

export const prepareUpdatableDataRow = (def: GenTableDef, rowData: GenDataRow): GenUpdatableDataRow => {
  rowData = { ...rowData, ...(rowData.operationalFields.updatedFields || {}) };
  const aRow: any = {};
  def.attributes.forEach(({ name, editable = true }) => {
    if (editable) {
      aRow[name] = rowData[name];
    }
  });

  const uRow = aRow as GenUpdatableDataRow;
  uRow.rowIndex = rowData.rowIndex;
  return uRow;
};

export const readLatestDataRowsFromContract = async (
  wrap: WrapFun,
  sbtManager: SBTManager
): Promise<DataRowEntry<GenUpdatableDataRow>[] | StatusMessage> =>
  wrap('Reading Rows from Contract...', async () => {
    const dataRowsEntries = await sbtManager.getLatestRowData<GenUpdatableDataRow>();
    if (isStatusMessage(dataRowsEntries)) {
      return dataRowsEntries;
    }
    for (const entry of dataRowsEntries) {
      const res = await sbtManager.decryptEncContent(entry.content);
      if (isStatusMessage(res)) {
        return res;
      }
      entry.data = JSON.parse(res) as GenUpdatableDataRow;
    }
    return dataRowsEntries;
  });

export const mergeInitialDataAndRowData = (
  initialDataRows: PRecord[],
  dataRowEntries: DataRowEntry<GenUpdatableDataRow>[]
): GenDataRow[] =>
  initialDataRows.map((initDataRow) => {
    const { id } = initDataRow;
    const editableRowEntry = dataRowEntries.find(({ data }) => data?.id === id);
    if (editableRowEntry) {
      const { data = {}, version, rowIndex, userAddress, status, created } = editableRowEntry;
      return {
        ...initDataRow,
        ...data,
        operationalFields: {
          version,
          rowIndex,
          userAddress,
          status,
          created
        }
      } as GenDataRow;
    } else {
      return {
        ...initDataRow,
        operationalFields: {
          version: -1,
          rowIndex: -1,
          userAddress: '',
          created: 0
        }
      } as GenDataRow;
    }
  });

export const createUpdatedFieldsMap = (unsaveDataRows: GenDataRow[]) =>
  unsaveDataRows.reduce<Record<string, any>>((acc, e) => {
    if (e.id && e.operationalFields.updatedFields) {
      acc[e.id.toString()] = e.operationalFields.updatedFields;
    }

    return acc;
  }, {});

export const mergeUnsavedDataRows = ({
  initialDataRows,
  updatedFieldsMap
}: {
  updatedFieldsMap: Record<string, PRecord>;
  initialDataRows: GenDataRow[];
}): GenDataRow[] => {
  return initialDataRows.map((dataRow0) => {
    const newDataRow = { ...dataRow0 };
    const updatedFields = updatedFieldsMap[newDataRow.id.toString()];
    if (updatedFields) {
      const newFields = { ...updatedFields };
      Object.keys(updatedFields).forEach((key) => {
        const value = newFields[key as SMDataRowUpdateableKeys];
        if (value === newDataRow[key as SMDataRowKeys]) {
          // @ts-ignore
          delete newFields[key];
        }
      });
      if (Object.keys(newFields).length > 0) {
        newDataRow.operationalFields.updatedFields = newFields;
      } else {
        delete newDataRow.operationalFields.updatedFields;
      }
    }
    return newDataRow;
  });
};

export const saveRowData = async ({
  wrap,
  sbtManager,
  rowIndex,
  updatableRow
}: {
  wrap: WrapFun;
  sbtManager: SBTManager;
  rowIndex: number;
  updatableRow: PRecord;
}): Promise<StatusMessage | undefined | number> =>
  wrap('Save Salary Manager Row Data...', async () => {
    const data = JSON.stringify(updatableRow);

    const content = await sbtManager.encryptContent(data);
    if (isStatusMessage(content)) {
      return content;
    }
    if (rowIndex < 0) {
      return await sbtManager.addRowData(content);
    } else {
      return await sbtManager.setDataRow(+rowIndex, content);
    }
  });
