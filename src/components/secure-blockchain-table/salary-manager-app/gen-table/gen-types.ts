import { PRecord, PValue } from '../../../../ui-factory/types';

export type FormatterFun = (value: PValue, data?: PRecord) => string;
export type FormatterDic = Record<string, FormatterFun>;

export type GenAttType = 'number' | 'string' | 'boolean';
export type AttStyle = 'normal' | 'bold';

export interface GenAttributeDef {
  name: string;
  defaultValue?: PValue;
  visible?: boolean;
  editable?: boolean;
  type?: GenAttType;
  formatter?: string;
  style?: AttStyle;
  groups?: string[];
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
      groups: ['prevWork']
    },
    {
      name: 'prevMonthsWorked',
      type: 'number',
      editable: false,
      groups: ['prevWork']
    },
    {
      name: 'prevEmployeeFunction',
      type: 'number',
      editable: false,
      groups: ['prevWork']
    },
    {
      name: 'newPartTime',
      type: 'number',
      groups: ['newWork']
    },
    {
      name: 'newMonthsWorked',
      type: 'number',
      groups: ['newWork']
    },
    {
      name: 'newEmployeeFunction',
      type: 'string',
      groups: ['newWork']
    },
    {
      name: 'prevFixed',
      type: 'number',
      groups: ['prevComp']
    },
    {
      name: 'prevBonus',
      type: 'number',
      editable: false,
      groups: ['prevComp']
    },
    {
      name: 'prevCarAllowance',
      type: 'number',
      editable: false,
      groups: ['prevComp']
    },
    {
      name: 'prevMobileAllowance',
      type: 'number',
      editable: false,
      groups: ['prevComp']
    },
    {
      name: 'prevPensionFundPayment',
      type: 'number',
      editable: false,
      groups: ['prevComp']
    },
    {
      name: 'prevOther',
      type: 'number',
      editable: false,
      groups: ['prevComp']
    },
    {
      name: 'newFixed',
      type: 'number',
      groups: ['newComp']
    },
    {
      name: 'newBonus',
      type: 'number',
      groups: ['newComp']
    },
    {
      type: 'number',
      name: 'newCarAllowance',
      groups: ['newComp']
    },
    {
      name: 'newMobileAllowance',
      type: 'number',
      groups: ['newComp']
    },
    {
      name: 'newPensionFundPayment',
      type: 'number',
      groups: ['newComp']
    },
    {
      name: 'newOther',
      type: 'number',
      groups: ['newComp']
    },
    {
      name: 'prevCompTotal',
      type: 'number',
      groups: ['summaries']
    },
    {
      name: 'newCompTotal',
      type: 'number',
      groups: ['summaries']
    },
    {
      name: 'comparePercentage',
      type: 'number',
      formatter: 'percentage',
      sumRow: 'average',
      groups: ['summaries']
    }
  ]
};

export interface OperationalFields {
  // operational
  dirty: boolean;
  version: number;
  userAddress: string;

  created?: number;
  status?: number;
  updatedFields?: string[];
}
