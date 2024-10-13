import * as React from 'react';
import { FC } from 'react';
import { InputAdornment, TextFieldProps } from '@mui/material';
import TextField from '@mui/material/TextField';

export const PrefixTextField: FC<TextFieldProps & { prefix: string }> = (props) => {
  return (
    <TextField
      {...props}
      autoFocus
      fullWidth
      slotProps={{
        input: {
          startAdornment: <InputAdornment position="start">{props.prefix}</InputAdornment>
        }
      }}
    />
  );
};
