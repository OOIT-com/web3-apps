import React, { ReactElement } from 'react';
import { Box } from '@mui/material';
import {
  AttributeDef,
  DynamicBooleanAttributeValue,
  PRecord,
  ReactWidget,
  WidgetActionFun,
  WidgetProps
} from './types';
import { InputUi } from './widgets/InputUi';

export function AttributeUi({
  attDef,
  index,
  widgetAction,
  cxRow
}: {
  attDef: AttributeDef;
  index: number;
  widgetAction: WidgetActionFun;
  cxRow: PRecord;
}): ReactElement {
  const visible = resolveVisible(attDef.visible, cxRow);
  if (visible) {
    const reactWidgetFun: ReactWidget = attDef.uiType || InputUi;
    const props: WidgetProps = {
      def: attDef,
      value: cxRow[attDef.name],
      cx: cxRow,
      action: widgetAction
    };
    return (
      <Box key={index} sx={{ margin: '0.6em 0 0.4em 0' }}>
        {React.createElement(reactWidgetFun, props, null)}
      </Box>
    );
  }
  return <></>;
}

export function resolveVisible(propValue: DynamicBooleanAttributeValue = true, cx: PRecord) {
  if (typeof propValue === 'boolean') {
    return propValue;
  }
  if (propValue === 'true') {
    return true;
  }
  if (propValue === 'false') {
    return false;
  }
  if (typeof propValue === 'function') {
    return propValue(cx);
  }
}
