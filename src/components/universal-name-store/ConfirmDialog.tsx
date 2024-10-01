import * as React from 'react';
import { FC } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { ConfirmData } from './types';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { Box, Stack } from '@mui/material';

export const ConfirmDialog: FC<{ confirmData: ConfirmData }> = ({
  confirmData: { title, cancel, accept, content = [] }
}) => {
  return (
    <Dialog open={true} onClose={cancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>{content.map((e) => (typeof e === 'string' ? <Box key={e}>{e}</Box> : e))}</Stack>
      </DialogContent>
      <DialogActions>
        <Button key={'accept'} onClick={() => accept()}>
          Accept
        </Button>
        <Button key={'logout'} onClick={() => cancel()}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
