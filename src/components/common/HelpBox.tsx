import * as React from 'react';
import { FC, ReactNode } from 'react';
import { Stack } from '@mui/material';
import { NotifyFun } from '../../types';
import { MDElement } from './MDElement';
import { withStyles } from 'tss-react/mui';
import { grey } from '@mui/material/colors';

export const HelpBox: FC<{ help: string | ReactNode; done: NotifyFun }> = ({ help, done }) => {
  const content = typeof help === 'string' ? <MDElement mdFile={help} close={done} /> : help;

  return <HelpStack key={'content'}>{content}</HelpStack>;
};

export const HelpStack = withStyles(Stack, (theme) => ({
  root: {
    padding: '1em'
  }
}));
