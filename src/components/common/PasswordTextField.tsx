import * as React from 'react';
import { FC, useState } from 'react';
import { IconButton, InputAdornment, TextFieldProps } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import TextField from '@mui/material/TextField';

type PasswordTextFieldProps = Omit<TextFieldProps, 'type' | 'multiline'> & {
  showPassword?: boolean;
};

export const PasswordTextField: FC<PasswordTextFieldProps> = (props) => {
  const [showPassword, setShowPassword] = useState(props.showPassword === true);

  return (
    <TextField
      {...props}
      type={showPassword ? 'text' : 'password'}
      autoFocus
      fullWidth
      multiline={showPassword}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton aria-label="toggle password visibility" onClick={() => setShowPassword((b) => !b)} edge="end">
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          )
        }
      }}
    />
  );
};
