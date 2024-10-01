export interface SMUpdatableDataRow {
  // updateable
  userId: string;
  rowIndex: number;
  newPartTime: number;
  newMonthsWorked: number;
  newEmployeeFunction: string;
  newFixed: number;
  newBonus: number;
  newCarAllowance: number;
  newMobileAllowance: number;
  newPensionFundPayment: number;
  newOther: number;
}

export type UpdatedFields = Partial<SMUpdatableDataRow>;
export type UpdatedFieldsMap = Record<string, UpdatedFields>;

export interface SMDataRowOperational {
  // operational
  dirty: boolean;
  version: number;
  userAddress: string;

  created?: number;
  status?: number;
  updatedFields?: UpdatedFields;
}

export interface SMDataRow extends SMDataRowOperational, SMUpdatableDataRow {
  userId: string;
  firstName: string;
  lastName: string;
  entryDate: string;
  officeId: string;
  currency: string;
  prevEmployeeFunction: string;

  // readonly
  prevPartTime: number;
  prevMonthsWorked: number;
  prevFixed: number;
  prevBonus: number;
  prevCarAllowance: number;
  prevMobileAllowance: number;
  prevPensionFundPayment: number;
  prevOther: number;

  // derived
  prevCompTotal: number;
  newCompTotal: number;
  comparePercentage: number;
}

export type SMDataRowKeys = keyof SMDataRow;
export type SMDataRowUpdateableKeys = keyof SMUpdatableDataRow;

export type AttType = 'number' | 'text' | 'boolean';
export type AttStyle = 'normal' | 'bold';

export interface AttributeDef<N, R> {
  name: N;
  visible?: boolean;
  editable?: boolean;
  type?: AttType;
  formatter?: (value: any, data?: R) => string;
  style?: AttStyle;
  sumRow?: 'average' | 'sum' | 'count';
  cellStyle?: {
    pinned?: 'left' | 'right';
    style?: AttStyle;
    maxWidth?: number;
    minWidth?: number;
    flex?: number;
    cellClass?: string;
  };
}

export type ResizeMode = 'sizeToFit' | 'autoSizeAll';
export const smTableRowAttributes: AttributeDef<SMDataRowKeys, SMDataRow>[] = [
  { name: 'userId', visible: false },

  { name: 'officeId', visible: false },
  { name: 'currency', visible: false },

  { name: 'firstName', editable: false, cellStyle: { pinned: 'left', maxWidth: 80, flex: 1, cellClass: 'last-name' } },
  { name: 'lastName', editable: false, cellStyle: { pinned: 'left', cellClass: 'last-name' } },
  { name: 'entryDate', editable: false, cellStyle: { pinned: 'left', cellClass: 'last-name' } },

  { name: 'prevPartTime', type: 'number', editable: false },
  { name: 'newPartTime', type: 'number' },

  { name: 'prevMonthsWorked', type: 'number', editable: false },
  { name: 'newMonthsWorked', type: 'number' },

  { name: 'prevEmployeeFunction', editable: false },
  { name: 'newEmployeeFunction' },

  { name: 'prevFixed', type: 'number', editable: false },
  { name: 'newFixed', type: 'number' },

  { name: 'prevBonus', type: 'number', editable: false },
  { name: 'newBonus', type: 'number' },

  { name: 'prevCarAllowance', type: 'number', editable: false },
  { name: 'newCarAllowance', type: 'number' },

  { name: 'prevMobileAllowance', type: 'number', editable: false },
  { name: 'newMobileAllowance', type: 'number' },

  { name: 'prevPensionFundPayment', type: 'number', editable: false },
  { name: 'newPensionFundPayment', type: 'number' },

  { name: 'prevOther', type: 'number', editable: false },
  { name: 'newOther', type: 'number' },

  { name: 'prevCompTotal', type: 'number', editable: false },
  { name: 'newCompTotal', type: 'number', editable: false },

  {
    name: 'comparePercentage',
    type: 'number',
    editable: false,
    formatter: (value: number) => `${Math.round(value * 100)} %`,
    sumRow: 'average'
  }
];

export type ToggleState<T extends string> = {
  [key in T]: boolean;
};

export type ColumnSelectionState = Partial<ToggleState<ColumnSelectionName>>;

export const columnSelectionNames: ColumnSelectionName[] = ['summaries', 'prevWork', 'newWork', 'prevComp', 'newComp'];
export type ColumnSelectionName = 'summaries' | 'prevComp' | 'newComp' | 'prevWork' | 'newWork';

export type ColumnSelection = Record<ColumnSelectionName, SMDataRowKeys[] | null>;

export type SMTableMode = 'initialData' | 'editable' | 'readonly';
