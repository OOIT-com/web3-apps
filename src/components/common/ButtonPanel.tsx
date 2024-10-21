import * as React from 'react';
import { FC, PropsWithChildren, ReactNode } from 'react';
import { Stack, SxProps } from '@mui/material';

type Mode = 'left' | 'right' | 'center' | 'space-between' | 'space-around';
const styles: Record<Mode, SxProps> = {
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
    sx?: SxProps;
  }>
> = (props) => {
  const { content, mode = 'right', children, sx = {} } = props;
  // let sxFinal: SxProps = styles[mode] || {};
  // if (typeof sx === 'object' && typeof sxFinal === 'object') {
  //   sxFinal = { ...sx, ...sxFinal };
  // }

  const sxFinal: any = {
    ...(typeof sx === 'function' ? {} : sx),
    ...(typeof styles[mode] === 'function' ? {} : styles[mode])
  };

  return (
    <Stack direction={'row'} spacing={1} sx={sxFinal}>
      {content ?? children}
    </Stack>
  );
};
