import { withStyles } from 'tss-react/mui';
import { LDBox } from './StyledBoxes';

export const StyledHead = withStyles(LDBox, (theme) => ({
  root: {
    fontSize: '110%',
    fontWeight: '600'
  }
}));
