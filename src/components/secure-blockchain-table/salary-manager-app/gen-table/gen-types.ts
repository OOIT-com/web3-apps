import { IdValue, PRecord, PValue } from '../../../../ui-factory/types';

export type FormatterFun = (value: PValue | PRecord, data?: PRecord) => string;
export type FormatterDic = Record<string, FormatterFun>;

export type GenUpdateRowFun = (cmd: 'update' | 'reset' | 'delete', id: IdValue, field: string, value: any) => void;

export type GenAttType = 'number' | 'string' | 'boolean';
export type GenAttStyle = 'normal' | 'bold';

export interface GenAttributeDef {
  name: string;
  defaultValue?: PValue;
  visible?: boolean;
  editable?: boolean;
  type?: GenAttType;
  formatter?: string;
  style?: GenAttStyle;
  selectionGroups?: string[];
  sumRow?: 'average' | 'sum' | 'count';
  cellStyle?: {
    pinned?: 'left' | 'right';
    style?: GenAttStyle;
    maxWidth?: number;
    minWidth?: number;
    flex?: number;
    cellClass?: string;
  };
}
export type GenTableMode = 'initialData' | 'editable' | 'readonly';
export type ResizeMode = 'sizeToFit' | 'autoSizeAll';
export type SaveDataRowFun = (dataRow: GenDataRow) => void;
export type GenUpdatableDataRow = PRecord;
export interface OperationalFields {
  // operational

  rowIndex: number;
  dirty: boolean;
  version: number;
  userAddress: string;

  created?: number;
  status?: number;
  updatedFields?: PRecord;
}

export type GenDataRow = PRecord & { operationalFields: OperationalFields };

export type SelectionGroups = string[];

export type SumRow = string[];

export interface GenTableDef {
  selectionGroups: SelectionGroups;
  attributes: GenAttributeDef[];
  sumRows: SumRow[];
}

export const testdef: GenTableDef = {
  selectionGroups: [],
  sumRows: [],
  attributes: [
    {
      name: 'userId',
      type: 'string',
      editable: false,
      visible: false
    },
    {
      name: 'firstName',
      type: 'string',
      editable: false
    },
    {
      name: 'lastName',
      type: 'string',
      editable: false
    },
    {
      name: 'entryDate',
      type: 'number',
      editable: false
    },
    {
      name: 'officeId',
      type: 'string',
      editable: false
    },
    {
      name: 'currency',
      type: 'string',
      editable: false
    },
    {
      name: 'prevEmployeeFunction',
      type: 'number',
      editable: false
    },
    {
      name: 'prevPartTime',
      type: 'number',
      editable: false,
      selectionGroups: ['prevWork']
    },
    {
      name: 'prevMonthsWorked',
      type: 'number',
      editable: false,
      selectionGroups: ['prevWork']
    },
    {
      name: 'prevEmployeeFunction',
      type: 'number',
      editable: false,
      selectionGroups: ['prevWork']
    },
    {
      name: 'newPartTime',
      type: 'number',
      selectionGroups: ['newWork']
    },
    {
      name: 'newMonthsWorked',
      type: 'number',
      selectionGroups: ['newWork']
    },
    {
      name: 'newEmployeeFunction',
      type: 'string',
      selectionGroups: ['newWork']
    },
    {
      name: 'prevFixed',
      type: 'number',
      selectionGroups: ['prevComp']
    },
    {
      name: 'prevBonus',
      type: 'number',
      editable: false,
      selectionGroups: ['prevComp']
    },
    {
      name: 'prevCarAllowance',
      type: 'number',
      editable: false,
      selectionGroups: ['prevComp']
    },
    {
      name: 'prevMobileAllowance',
      type: 'number',
      editable: false,
      selectionGroups: ['prevComp']
    },
    {
      name: 'prevPensionFundPayment',
      type: 'number',
      editable: false,
      selectionGroups: ['prevComp']
    },
    {
      name: 'prevOther',
      type: 'number',
      editable: false,
      selectionGroups: ['prevComp']
    },
    {
      name: 'newFixed',
      type: 'number',
      selectionGroups: ['newComp']
    },
    {
      name: 'newBonus',
      type: 'number',
      selectionGroups: ['newComp']
    },
    {
      type: 'number',
      name: 'newCarAllowance',
      selectionGroups: ['newComp']
    },
    {
      name: 'newMobileAllowance',
      type: 'number',
      selectionGroups: ['newComp']
    },
    {
      name: 'newPensionFundPayment',
      type: 'number',
      selectionGroups: ['newComp']
    },
    {
      name: 'newOther',
      type: 'number',
      selectionGroups: ['newComp']
    },
    {
      name: 'prevCompTotal',
      type: 'number',
      selectionGroups: ['summaries']
    },
    {
      name: 'newCompTotal',
      type: 'number',
      selectionGroups: ['summaries']
    },
    {
      name: 'comparePercentage',
      type: 'number',
      formatter: 'percentage',
      sumRow: 'average',
      selectionGroups: ['summaries']
    }
  ]
};
