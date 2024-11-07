import { isStatusMessage, StatusMessage } from '../../../types';
import { SMInitialData } from './types';
import { WrapFun } from '../../AppContextProvider';
import { DataRowEntry, SBTManager } from '../../../contracts/secure-blockchain-table/SecureBlockchainTable-support';
import {
  SMDataRow,
  SMDataRowKeys,
  SMDataRowUpdateableKeys,
  smTableRowAttributes,
  SMUpdatableDataRow,
  UpdatedFieldsMap
} from './sm-table/types';
import { read, WorkBook } from 'xlsx';

export const getSMInitialDataFromContract = async (
  wrap: WrapFun,
  sbtManager: SBTManager
): Promise<SMInitialData | StatusMessage> => {
  const data = await getInitialDataFromContract(wrap, sbtManager);
  if (isStatusMessage(data)) {
    return data;
  }
  return JSON.parse(data) as SMInitialData;
};

export const getInitialDataFromContract = async (
  wrap: WrapFun,
  sbtManager: SBTManager
): Promise<string | StatusMessage> =>
  wrap('Loading Initial Data...', async () => {
    const data = await sbtManager.getInitialData();
    if (isStatusMessage(data)) {
      return data;
    }
    const decData = await sbtManager.decryptEncContent(data);
    if (isStatusMessage(decData)) {
      return decData;
    }
    return decData;
  });

export const saveInitialData = async (wrap: WrapFun, sbtManager: SBTManager, initialData: string) =>
  wrap('Save Initial Data...', async () => {
    //const data = JSON.stringify(initialData);

    const encData = await sbtManager.encryptContent(initialData);
    if (isStatusMessage(encData)) {
      return encData;
    }
    const res = await sbtManager.setInitialData(encData);
    if (isStatusMessage(res)) {
      return res;
    }
  });

export const readLatestDataRowsFromContract = async (
  wrap: WrapFun,
  sbtManager: SBTManager
): Promise<DataRowEntry<SMUpdatableDataRow>[] | StatusMessage> =>
  wrap('Reading Rows from Contract...', async () => {
    const dataRowsEntries = await sbtManager.getLatestRowData<SMUpdatableDataRow>();
    if (isStatusMessage(dataRowsEntries)) {
      return dataRowsEntries;
    }
    for (const entry of dataRowsEntries) {
      const res = await sbtManager.decryptEncContent(entry.content);
      if (isStatusMessage(res)) {
        return res;
      }
      entry.data = JSON.parse(res) as SMUpdatableDataRow;
    }
    return dataRowsEntries;
  });

export const prepareUpdatableDataRow = (rowData: SMDataRow): SMUpdatableDataRow => {
  rowData = { ...rowData, ...(rowData.updatedFields || {}) };
  const aRow: any = {};
  smTableRowAttributes.forEach(({ name, editable = true }) => {
    if (editable) {
      aRow[name] = rowData[name];
    }
  });

  const uRow = aRow as SMUpdatableDataRow;
  uRow.rowIndex = rowData.rowIndex;
  return uRow;
};

export const saveRowData = async (
  wrap: WrapFun,
  sbtManager: SBTManager,
  updatableRow: SMUpdatableDataRow
): Promise<StatusMessage | undefined | number> =>
  wrap('Save Salary Manager Row Data...', async () => {
    const data = JSON.stringify(updatableRow);

    const content = await sbtManager.encryptContent(data);
    if (isStatusMessage(content)) {
      return content;
    }
    const rowIndex = updatableRow.rowIndex;
    if (rowIndex < 0) {
      return await sbtManager.addRowData(content);
    } else {
      return await sbtManager.setDataRow(rowIndex, content);
    }
  });

export const createUpdatedFieldsMap = (unsaveDataRows: SMDataRow[]) =>
  unsaveDataRows.reduce<Record<string, Partial<SMUpdatableDataRow>>>((acc, e) => {
    if (e.updatedFields) {
      acc[e.userId] = e.updatedFields;
    }

    return acc;
  }, {});

export const mergeUnsavedDataRows = ({
  initialDataRows,
  updatedFieldsMap
}: {
  updatedFieldsMap: UpdatedFieldsMap;
  initialDataRows: SMDataRow[];
}): SMDataRow[] => {
  return initialDataRows.map((dataRow0) => {
    const newDataRow = { ...dataRow0 };
    const updatedFields = updatedFieldsMap[newDataRow.userId];
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
        newDataRow.updatedFields = newFields;
      } else {
        delete newDataRow.updatedFields;
      }
    }
    return newDataRow;
  });
};

export const mergeInitialDataAndRowData = (
  initialDataRows: SMDataRow[],
  dataRowEntries: DataRowEntry<SMUpdatableDataRow>[]
): SMDataRow[] =>
  initialDataRows.map((initDataRow) => {
    const { userId } = initDataRow;
    const editableRowEntry = dataRowEntries.find(({ data }) => data?.userId === userId);
    if (editableRowEntry) {
      const { data = {}, version, rowIndex, userAddress, status, created } = editableRowEntry;
      return {
        ...initDataRow,
        ...data,
        version,
        rowIndex,
        userAddress,
        status,
        created
      };
    } else {
      return { ...initDataRow };
    }
  });

/*
  Returns a) updated row.updatedFields and b) updated row with row.updatedFields c) recalculated compensation
 */
export const applyUpdateCellEvent = (
  dataRows: SMDataRow[],
  {
    userId,
    field,
    value
  }: {
    userId: string;
    field: SMDataRowUpdateableKeys;
    value: any;
  }
): SMDataRow[] =>
  dataRows.map((dataRow) => {
    if (dataRow.userId === userId) {
      const newDataRow = { ...dataRow };
      const sameValue = newDataRow[field] === value;
      if (newDataRow.updatedFields && sameValue) {
        delete newDataRow.updatedFields[field];
        if (Object.keys(newDataRow.updatedFields).length === 0) {
          delete newDataRow.updatedFields;
        }
      } else if (!sameValue) {
        newDataRow.updatedFields = { ...(newDataRow.updatedFields || {}), [field]: value };
      }
      return newDataRow;
    }
    return dataRow;
  });

//
// Technical Functions
//
export async function readFileToBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    function handleEvent(event: any) {
      resolve(event.target.result);
    }

    reader.addEventListener('load', handleEvent);

    reader.onerror = () => {
      reject(new Error(`An error occurred while converting a file to a buffer!`));
    };

    reader.readAsArrayBuffer(file);
  });
}

export async function loadWorkBook(file: File): Promise<WorkBook | undefined> {
  if (!file) {
    return;
  }
  const res = await readFileToBuffer(file);
  return read(res);
}
