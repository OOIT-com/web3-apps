import { Checkbox, FormControlLabel, Stack } from '@mui/material';
import { FC } from 'react';
import { ColumnSelectionName, columnSelectionNames, ColumnSelectionState } from './types';
import { saveToggleState } from './utils';

export const SMColumnSelection: FC<{
  toggleState: ColumnSelectionState;
  setToggleState: (t: ColumnSelectionState) => void;
  prevYear: number;
  newYear: number;
}> = ({ toggleState, setToggleState, prevYear, newYear }) => {
  const labels: Record<ColumnSelectionName, string> = {
    summaries: 'Sums',
    prevComp: `${prevYear} Comp:`,
    newComp: `${newYear}  Comp.`,
    prevWork: `${prevYear} Work`,
    newWork: `${newYear} Work`
  };
  return (
    <Stack key={'title-row'} direction={'row'} justifyContent="flex-start" alignItems="baseline" spacing={2}>
      {columnSelectionNames.map((sel) => (
        <FormControlLabel
          key={sel}
          control={
            <Checkbox
              size="small"
              checked={toggleState[sel]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const newState = { ...toggleState, [sel]: e.target.checked };
                console.debug(newState);
                saveToggleState(newState, '');
                setToggleState(newState);
              }}
            />
          }
          label={`${labels[sel]}`}
        />
      ))}
    </Stack>
  );
};
