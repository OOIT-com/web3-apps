import React, { FC, useMemo } from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';
import { PValue, WidgetProps } from '../types';
import { StatusMessageElement } from '../../components/common/StatusMessageElement';
import { errorMessage } from '../../types';

let counter = 1;
let id = () => '' + counter++;

export const SelectUi: FC<WidgetProps & { sx?: SxProps<Theme>; size?: 'small' | 'medium' }> = ({
  def,
  value,
  action,
  sx,
  size = 'small'
}) => {
  const labelId = useMemo(() => id(), []);

  if (!def.uiTypeOptions?.selectList) {
    return <StatusMessageElement statusMessage={errorMessage('Missing def.uiTypeOptions?.selectList')} />;
  }

  //
  const editable = def.editable !== false;
  return (
    <FormControl fullWidth={true} sx={sx} size="small">
      <InputLabel id={labelId} sx={{ display: def.noLabel ? 'none' : undefined }}>
        {def.label ?? def.name}
      </InputLabel>
      <Select<string>
        size={size}
        labelId={labelId}
        label={def.label ?? def.name}
        value={(value ?? def.defaultValue ?? '').toString()}
        onChange={(e: SelectChangeEvent<string>) => {
          if (action) {
            const value = e.target.value as PValue;
            action({ [def.name]: value });
          }
        }}
        disabled={!editable}
      >
        {def.uiTypeOptions.selectList.map(({ value, label }) => {
          return (
            <MenuItem key={value.toString()} value={value.toString()}>
              {label}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};
