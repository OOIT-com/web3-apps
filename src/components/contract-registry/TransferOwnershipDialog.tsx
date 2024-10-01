import { NotifyFun, StatusMessage } from '../../types';
import * as React from 'react';
import { ReactNode, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { Button, Stack, TextField } from '@mui/material';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { LDBox } from '../common/StyledBoxes';

export function TransferOwnershipDialog({
  done,
  transfer,
  title
}: {
  readonly done: NotifyFun;
  readonly transfer: (newOwner: string) => Promise<StatusMessage>;
  readonly title: ReactNode | string;
}) {
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [newOwner, setNewOwner] = useState('');

  return (
    <Dialog open={true} onClose={() => done()} maxWidth={'md'}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />
        <Stack spacing={2} sx={{ width: '30em', padding: '1em 0' }}>
          <LDBox sx={{ fontSize: '1.3em', margin: '1em 0 0.4em 0' }}>{title}</LDBox>

          <TextField label={'New Owner'} onChange={(e) => setNewOwner(e.target.value)} />

          <Stack direction={'row'} alignItems={'flex-end'} justifyContent={'space-between'}>
            <Button
              disabled={!newOwner}
              onClick={async () => {
                const res = await transfer(newOwner);
                if (res.status !== 'success') {
                  setStatusMessage(res);
                } else {
                  done();
                }
              }}
              key={'action'}
            >
              Confirm
            </Button>
            <Button key={'close'} onClick={() => done()}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
