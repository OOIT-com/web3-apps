import React, { useEffect, useState } from 'react';
import { Checkbox, FormControl, FormControlLabel } from '@mui/material';
import { WidgetProps } from '../types';
import { resolveBoolean } from '../utils';

let counter = 0;

export function CheckboxUi({
  def,
  value,
  action = () => {},
  cx = {},
  size,
  labelPlacement
}: WidgetProps & {
  labelPlacement?: 'end' | 'start' | 'top' | 'bottom';
  size?: 'small' | 'medium' | 'large';
}) {
  const [currentValue, setCurrentValue] = useState('');

  useEffect(() => setCurrentValue((value || def.defaultValue || '').toString()), [def, value]);

  let name = 'CheckboxUi-name-' + counter++;
  let emptyClassName = currentValue ? '' : 'empty';
  //
  let editable = resolveBoolean(def, 'editable', cx, true);
  let editableClassName = editable ? '' : 'disabled';

  let onValue = def.uiTypeOptions?.onValue || 'true';
  let offValue = def.uiTypeOptions?.offValue || 'false';

  return render();

  function render() {
    return (
      <FormControl variant={'outlined'}>
        <FormControlLabel
          className={[emptyClassName, editableClassName].join(' ')}
          label={def.label || 'no-label'}
          labelPlacement={labelPlacement}
          control={
            <Checkbox
              size={size}
              disabled={!editable}
              name={name}
              checked={value === onValue}
              onChange={(e) => {
                const v = (e.target.checked ? onValue : offValue).toString();
                action({ [def.name]: v });
              }}
              className="form-check-input"
            />
          }
        ></FormControlLabel>
      </FormControl>
    );
  }
}
