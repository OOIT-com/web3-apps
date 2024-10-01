import { Box, Table, TableBody } from '@mui/material';
import React from 'react';
import { AttributeUi } from './AttributeUi';
import { AttributeDef, PRecord, SetData } from './types';
import TableRowComp from '../components/common/TableRowComp';

export const AttributeTableUi = ({
  data,
  setData,
  attributeDefs
}: {
  data: PRecord;
  setData: SetData;
  attributeDefs: AttributeDef[];
}) => (
  <Table>
    <TableBody>
      {attributeDefs.map((attDef, index) => (
        <TableRowComp
          key={attDef.name}
          elements={[
            <LabelUi key={'label'} label={attDef.label || attDef.name} />,
            <AttributeUi
              attDef={{ ...attDef, noLabel: true }}
              index={index}
              widgetAction={(value) => setData({ ...data, ...value })}
              cxRow={data}
            />
          ]}
        />
      ))}
    </TableBody>
  </Table>
);

function LabelUi({ label }: { label: string }) {
  return <Box>{label}</Box>;
}
