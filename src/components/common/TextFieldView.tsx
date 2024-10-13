import { Box } from '@mui/material';

export function TextFieldView({ value, label }: { value: string; label: string }) {
  return (
    <Box sx={{ padding: '0.4em', border: 'solid gray 1px', margin: '0.2em', borderRadius: '0.2em' }}>
      <Box sx={{ fontSize: '0.8em', marginBottom: '0.8em', fontStyle: 'italic', color: 'gray' }}>{label}</Box>
      <Box sx={{ fontSize: '1em', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</Box>
    </Box>
  );
}
