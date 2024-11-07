import * as React from 'react';
import { FC, ReactNode } from 'react';
import { Stack } from '@mui/material';
import { NotifyFun } from '../../types';
import { MDElement } from './MDElement';

export const HelpBox: FC<{ help: string | ReactNode; done: NotifyFun }> = ({ help, done }) => {
  const content = typeof help === 'string' ? <MDElement mdFile={help} close={done} /> : help;
  return (
    <Stack sx={{ background: '#eeeeee', padding: '1em' }} key={'content'}>
      {content}
    </Stack>
  );
};
