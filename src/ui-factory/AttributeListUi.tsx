import { Stack } from '@mui/material';
import React from 'react';
import { AttributeUi } from './AttributeUi';
import { AttributeDef, PRecord, SetData } from './types';

export const AttributeListUi = ({
  data,
  setData,
  attributeDefs
}: {
  data: PRecord;
  setData: SetData;
  attributeDefs: AttributeDef[];
}) => (
  <Stack spacing={2}>
    {attributeDefs.map((attDef, index) => (
      <React.Fragment key={attDef.name}>
        {!!index && <hr key={`${index}`} />}
        <AttributeUi
          attDef={attDef}
          index={index}
          widgetAction={(value) => setData({ ...data, ...value })}
          cxRow={data}
        />
      </React.Fragment>
    ))}
  </Stack>
);
