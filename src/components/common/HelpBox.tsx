import * as React from 'react';
import { FC, ReactNode } from 'react';
import { Stack } from '@mui/material';
import { NotifyFun } from '../../types';
import ReactMarkdown from 'react-markdown';

export const HelpBox: FC<{ help: string | ReactNode; done: NotifyFun }> = ({ help, done }) => {
  const content = typeof help === 'string' ? <ReactMarkdown>{help}</ReactMarkdown> : help;
  return (
    <Stack sx={{ background: '#eeeeee', padding: '1em' }} key={'content'}>
      {content}
    </Stack>
  );
};
