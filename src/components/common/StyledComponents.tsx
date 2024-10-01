import { withStyles } from 'tss-react/mui';
import { ListItemText } from '@mui/material';

export const StyledListItemText = withStyles(ListItemText, (theme) => ({
  root: { color: '#2196f3', fontWeight: '800 !important' }
}));
