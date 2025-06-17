import { Box, Table, TableBody } from '@mui/material';
import React from 'react';
import { AttributeUi } from './AttributeUi';
import { AttributeDef, PRecord, SetData } from './types';
import { TableRowComp } from '../components/common/TableRowComp';
import humanizeString from 'humanize-string';

export const AttributeTableUi = ({
  data,
  setData,
  attributeDefs
}: {
  data: PRecord;
  setData?: SetData;
  attributeDefs: AttributeDef[];
}) => (
  <Table>
    <TableBody>
      {attributeDefs.map((attDef, index) => (
        <TableRowComp
          key={attDef.name}
          elements={[
            <LabelUi key={'label'} label={attDef.label ?? humanizeString(attDef.name)} />,
            <AttributeUi
              key={'control'}
              attDef={{ ...attDef, noLabel: true }}
              index={index}
              widgetAction={(value) => {
                if (setData) {
                  setData({ ...data, ...value });
                }
              }}
              cxRow={data}
            />
          ]}
        />
      ))}
    </TableBody>
  </Table>
);

const LabelUi = ({ label }: { label: string }) => <Box sx={{ fontWeight: 600 }}>{label}</Box>;
