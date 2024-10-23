import { Checkbox, FormControlLabel, Stack } from '@mui/material';
import { FC } from 'react';
import { saveToggleState } from './gen-utils';
import humanizeString from 'humanize-string';

const columnSelectionNames = ['prevFix'];
export const GenColumnSelection: FC<{
  toggleState: string[];
  setToggleState: (t: string[]) => void;
}> = ({ toggleState, setToggleState }) => {
  return (
    <Stack key={'title-row'} direction={'row'} justifyContent="flex-start" alignItems="baseline" spacing={2}>
      {columnSelectionNames.map((sel) => (
        <FormControlLabel
          key={sel}
          control={
            <Checkbox
              size="small"
              checked={toggleState.includes(sel)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const newState = { ...toggleState, [sel]: e.target.checked };
                saveToggleState(newState, '');
                setToggleState(newState);
              }}
            />
          }
          label={humanizeString(sel)}
        />
      ))}
    </Stack>
  );
};
