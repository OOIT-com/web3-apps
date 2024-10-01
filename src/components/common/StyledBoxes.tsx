import { withStyles } from 'tss-react/mui';
import { Box, Grid, Stack } from '@mui/material';
import { grey } from '@mui/material/colors';

export const LDBoxCode = withStyles(Box, (theme) => ({
  root: {
    fontSize: '110%',
    fontWeight: '600',
    fontFamily: 'Courier',
    color: theme.palette.mode === 'dark' ? grey.A400 : 'inherit'
  }
}));

export const LDBox = withStyles(Stack, (theme) => ({
  root: {
    color: theme.palette.mode === 'dark' ? grey.A400 : grey.A700
  }
}));

export const LabelBox = withStyles(Box, (theme) => ({
  root: {
    fontWeight: 800
  }
}));

export const Header1 = withStyles(LDBox, (theme) => ({
  root: {
    fontSize: '2em',
    margin: '1em 0 0.4em 0'
  }
}));

export const Header2 = withStyles(LDBox, (theme) => ({
  root: {
    fontSize: '1.3em',
    margin: '1em 0 0.4em 0'
  }
}));
export const Header3 = withStyles(LDBox, (theme) => ({
  root: {
    fontSize: '1.2em',
    fontWeight: 'bold'
  }
}));
export const LDGridWithRoler = withStyles(Grid, (theme) => ({
  root: {
    borderTopColor: theme.palette.mode === 'dark' ? grey.A700 : grey.A400,
    borderTopWidth: '0.2em',
    borderTopStyle: 'solid'
  }
}));

export const PublicKeyBox = withStyles(Stack, (theme) => ({
  root: {
    fontSize: '110%',
    fontWeight: '600',
    fontFamily: 'Courier',
    color: theme.palette.mode === 'dark' ? grey.A400 : 'inherit'
  }
}));
