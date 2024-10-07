import { useMediaQuery, useTheme } from '@mui/material';

export function useIsSmall(): boolean {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('sm'));
}
