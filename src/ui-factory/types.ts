import { ReactElement } from 'react';

export type WidgetProps = {
  def: AttributeDef;
  value: PValue;
  cx?: PRecord;
  action?: WidgetActionFun;
};
export type WidgetActionFun = (value: PRecord) => void;

export interface AttributeDef<NAMES = string> {
  name: NAMES;
  ui?: ReactElement;
  labelId?: string;
  label?: string;
  description?: string;
  mandatory?: boolean;
  isKey?: boolean;
  defaultValue?: string;
  noLabel?: boolean;
  uiType?: ReactWidget;
  uiTypeOptions?: UiTypeOptions;
  inputType?: 'text' | 'number' | 'password';
  editable?: DynamicBooleanAttributeValue;
  visible?: DynamicBooleanAttributeValue;
  formatter?: FormatterFun;
  multiline?: boolean;
  uiSection?: string;
  hidden?: boolean;
  width?: number;
  minWidth?: number;
  height?: number;
  noColumnLabel?: boolean;
  className?: string;
  sortable?: boolean;
  maxRows?: number;
  filterInitValue?: string;
}

export interface SelectValue {
  value: PValue;
  label: string;
}

export interface UiTypeOptions {
  selectList?: SelectValue[];
  selectNames?: string[];
  onValue?: string;
  offValue?: string;
  accept?: string;
  fileTypes?: string[];
  noFilters?: boolean;
  resizable?: boolean;
  dataType?: 'number' | 'date' | 'string';
  codeTable?: string;
  withFilter?: boolean;
  columnSpan?: number;
  layout?: 'row';
}

export type DynamicBooleanAttributeValue = string | boolean | ((cx: PRecord) => boolean);

export type FormatterFun = (value: PValue) => string;

export type ReactWidget = (prop: WidgetProps) => ReactElement;

//export type SRecord = Record<string, string>;
export type IdValue = string | number;
export type PValue = boolean | string | number;
// PRecord should be at Record type that has names from Names, but not all names needed to be available
// export type PRecord<NAMES extends string = string> = Partial<Record<NAMES, PValue>>;
export type PRecord<NAMES extends string = string> = Record<NAMES, PValue>;

export type PRecordCompatible<T> = Pick<
  T,
  {
    [K in keyof T]: T[K] extends boolean | string | number ? K : never;
  }[keyof T]
>;

export type SetData = (data: PRecord) => void;
