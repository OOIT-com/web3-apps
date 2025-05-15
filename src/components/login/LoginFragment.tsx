import { Stack } from '@mui/material';

import logo from '../../images/keyblock200.png';
import { FC, ReactNode } from 'react';

export const LoginFragment: FC<{ content: ReactNode }> = (props) => {
  return (
    <Stack
      direction="column"
      alignItems="center"
      spacing={2}
      sx={{
        paddingTop: '4em !important',
        bgcolor: 'background.default',
        color: 'color.default',
        boxSizing: 'border-box',
        p: 0,
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        fontSize: '120%'
      }}
    >
      <Stack
        sx={{
          padding: '2em',
          marginBottom: '4em !important',
          boxSizing: 'border-box',
          boxShadow: '2px 2px 10px lightgrey'
        }}
      >
        <img src={logo} alt={'logo'} />
      </Stack>
      {props.content}
    </Stack>
  );
};
