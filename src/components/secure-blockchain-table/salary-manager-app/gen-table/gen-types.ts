import { IdValue, PRecord, PValue } from '../../../../ui-factory/types';

export type FormatterFun = (value: PValue | PRecord, data?: PRecord) => string;
export type FormatterDic = Record<string, FormatterFun>;

export type GenUpdateRowFun = (cmd: 'update' | 'reset' | 'delete', idValue: IdValue, field: string, value: any) => void;

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
  name: string;
  idName: string;
  selectionGroups: SelectionGroups;
  attributes: GenAttributeDef[];
  sumRows: SumRow[];
}
