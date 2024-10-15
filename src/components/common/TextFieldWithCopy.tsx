import * as React from 'react';
import { FC } from 'react';
import { IconButton, InputAdornment, TextFieldProps, Tooltip } from '@mui/material';
import TextField from '@mui/material/TextField';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

type PasswordTextFieldProps = Omit<TextFieldProps, 'type' | 'multiline'> & {
  showPassword?: boolean;
};

export const TextFieldWithCopy: FC<PasswordTextFieldProps> = (props) => {
  return (
    <TextField
      {...props}
      autoFocus
      fullWidth
      multiline={true}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title={'Copy to Clipboard!'}>
                <IconButton
                  aria-label="copy-content-to-clipboard"
                  onClick={async () => {
                    const v = props.value;
                    if (v && typeof v === 'string') {
                      await navigator.clipboard.writeText(v).catch(console.error);
                    }
                  }}
                  edge="end"
                >
                  {props.value ? (
                    <ContentCopyIcon
                      sx={{
                        fontSize: '100%'
                      }}
                    />
                  ) : (
                    ''
                  )}
                </IconButton>
              </Tooltip>
            </InputAdornment>
          )
        }
      }}
    />
  );
};
