import * as React from 'react';
import { FC, PropsWithChildren, ReactNode } from 'react';
import { Stack, Theme } from '@mui/material';
import { SystemStyleObject } from '@mui/system/styleFunctionSx/styleFunctionSx';

type Mode = 'left' | 'right' | 'center' | 'space-between' | 'space-around';
const styles: Record<Mode, SystemStyleObject<Theme>> = {
  left: {
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  right: {
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  'space-between': {
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  'space-around': {
    justifyContent: 'space-between',
    alignItems: 'center'
  }
};

export const ButtonPanel: FC<
  PropsWithChildren<{
    content?: ReactNode | ReactNode[];
    mode?: Mode;
    sx?: SystemStyleObject<Theme>;
  }>
> = (props) => {
  const { content, mode = 'right', children, sx = {} } = props;

  const sxFinal: SystemStyleObject<Theme> = {
    ...sx,
    ...styles[mode]
  };

  return (
    <Stack direction={'row'} spacing={1} sx={sxFinal}>
      {content ?? children}
    </Stack>
  );
};
