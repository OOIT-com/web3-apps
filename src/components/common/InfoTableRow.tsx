import * as React from 'react';
import { FC, ReactNode } from 'react';
import { Box, Stack } from '@mui/material';
import TableRowComp from './TableRowComp';
import { LabelBox } from './StyledBoxes';
import { ExternalLink } from './ExternalLink';

export type InfoRowProps = {
  label: string;
  type?: 'text' | 'link';
  values?: (string | ReactNode)[];
  value?: string | ReactNode;
};
export const InfoTableRow: FC<InfoRowProps> = ({ label, value, type = 'text', values }) => {
  let controls: ReactNode[] | string[] | null = null;

  if (value) {
    values = [value];
  }
  if (values) {
    if (type === 'text') {
      controls = values.map((v) => (typeof v === 'string' ? <Box key={v}>{v}</Box> : v));
    } else if (type === 'link') {
      controls = values.map((e) => (typeof e === 'string' ? <ExternalLink url={e} /> : e));
    }
  }
  if (controls === null) {
    return <></>;
  }
  return (
    <TableRowComp
      elements={[
        <LabelBox key={'label'}>{label}</LabelBox>,
        <Stack
          key={'controls'}
          direction="column"
          spacing={2}
          sx={{
            justifyContent: 'flex-start',
            alignItems: 'flex-start'
          }}
        >
          {controls}
        </Stack>
      ]}
    />
  );
};
