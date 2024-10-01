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
  name?: string;
  value?: string;
  code?: string;
  label?: string;
  labelId?: string;
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
export type PValue = boolean | string | number;
export type PRecord = Record<string, PValue>;
export type SetData = (data: PRecord) => void;
