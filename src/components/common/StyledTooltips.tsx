import * as React from 'react';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip';

export const MenuTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.text.primary
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.text.primary,
    color: theme.palette.background.paper,
    fontSize: '100%'
  }
}));
