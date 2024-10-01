import { withStyles } from 'tss-react/mui';
import { AccordionSummary, AppBar, Box, Stack } from '@mui/material';
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

export const Header2 = withStyles(LDBox, (theme) => ({
  root: {
    fontSize: '1.3em',
    margin: '1em 0 0.4em 0'
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

export const LDAccordionSummary = withStyles(AccordionSummary, (theme) => ({
  root: {
    color: theme.palette.mode === 'dark' ? grey.A400 : 'inherit',
    backgroundColor: theme.palette.mode === 'dark' ? grey['900'] : '#f2f2f2'
  }
}));

export const LDAppBar = withStyles(AppBar, (theme) => ({
  root: {
    background: theme.palette.mode === 'dark' ? grey['900'] : 'black',
    color: theme.palette.mode === 'dark' ? 'gray' : undefined
  }
}));
