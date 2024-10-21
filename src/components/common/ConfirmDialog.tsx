import * as React from 'react';
import { FC, PropsWithChildren, ReactNode } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { Stack } from '@mui/material';
import { NotifyFun } from '../../types';

export type ConfirmData = {
  title: ReactNode | string;
  content?: ReactNode[];
  accept: NotifyFun;
  cancel: NotifyFun;
};
export const ConfirmDialog: FC<PropsWithChildren<{ confirmData: ConfirmData }>> = ({
  confirmData: { title, cancel, accept, content = [] },
  children
}) => {
  return (
    <Dialog open={true} onClose={cancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>{content || children}</Stack>
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
