import React from 'react';
import { ReactWidget, WidgetProps } from '../types';
import { resolveEditable } from '../utils';
import { TextField } from '@mui/material';
import humanizeString from 'humanize-string';

let counter = 0;
export const InputUi: ReactWidget = ({ def, value, cx = {}, action }: Readonly<WidgetProps>) => {
  const id = 'InputUi' + counter++;

  let currentValue = value || '';

  const type = def.inputType ?? 'text';
  //
  const editable = resolveEditable({ def, cx, defaultValue: true });

  if (!editable && def.formatter) {
    currentValue = def.formatter(value);
  }

  const label = def.noLabel ? '' : def.label ?? humanizeString(def.name);

  return (
    <TextField
      size={'small'}
      label={label}
      autoComplete={'off'}
      fullWidth
      multiline={!!def.multiline}
      maxRows={def.maxRows}
      id={id}
      type={type}
      value={currentValue}
      onChange={(e) => (action ? action({ [def.name]: e.target.value }) : undefined)}
      disabled={!editable}
      sx={{
        color: 'black !important',
        '& .MuiInputBase-input': {
          color: 'black' // Set font color to black when disabled
        },
        '& .MuiInputLabel-root.Mui-disabled': {
          color: 'black' // Set label color to black when disabled
        }
      }}
    />
  );
};
