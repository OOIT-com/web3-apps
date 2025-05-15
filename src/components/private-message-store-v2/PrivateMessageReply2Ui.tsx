import * as React from 'react';
import { ChangeEvent, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { NotifyFun } from '../../types';
import { Box, Paper, Stack } from '@mui/material';
import { AddressDisplayWithAddressBook } from '../common/AddressDisplayWithAddressBook';
import { Message } from './private-message-store2-types';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { useAppContext } from '../AppContextProvider';

import { Web3NotInitialized } from '../common/Web3NotInitialized';
import { PrivateMessageStoreV2 } from '../../contracts/private-message-store/PrivateMessageStoreV2-support';
import {isStatusMessage, StatusMessage} from "../../utils/status-message";

export function PrivateMessageReply2Ui({
  messageToReply,
  done,
  privateMessageStoreV2
}: Readonly<{
  messageToReply: Message;
  done: NotifyFun;
  privateMessageStoreV2: PrivateMessageStoreV2;
}>) {
  const { wrap, web3Session } = useAppContext();
  const { web3, publicAddress, publicKey } = web3Session || {};
  const [subject, setSubject] = useState('Re:' + messageToReply.subject);
  const [text, setText] = useState('');
  const [statusMessage, setStatusMessage] = useState<StatusMessage | undefined>();

  if (!web3 || !publicAddress || !publicKey) {
    return <Web3NotInitialized />;
  }

  return (
    <Dialog open={true} onClose={done} fullWidth={true} maxWidth={'md'}>
      <DialogTitle>
        <Stack justifyContent="space-between" alignItems="baseline" spacing={2}>
          <Box key={'title'}>Reply to Message</Box>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={4}>
          <Paper variant={'outlined'} square={true} sx={{ padding: '1em' }}>
            <Stack spacing={2}>
              <Box key={'subject-disp'} sx={{ fontWeight: 600 }}>
                {messageToReply.subject}
              </Box>
              <Box key={'subject'}>{messageToReply.text}</Box>
            </Stack>
          </Paper>
          <Box key={'to'}>
            Reply to:
            <AddressDisplayWithAddressBook address={messageToReply.sender} />
          </Box>
          <TextField
            key={'reply-subject'}
            autoFocus
            margin="dense"
            value={subject}
            label="Reply Subject"
            fullWidth
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
            variant="standard"
          />
          <TextField
            key={'reply-text'}
            autoFocus
            margin="dense"
            value={text}
            label="Reply Text"
            fullWidth
            onChange={(e: ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
            variant="standard"
            multiline
          />
          <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ height: '4em' }}>
          <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
            <Button
              key={'send-reply'}
              disabled={!subject || !text}
              onClick={async () => {
                setStatusMessage(undefined);
                const res = await wrap('Reply to Message...', async () =>
                  privateMessageStoreV2.sendMessage(subject, text, messageToReply.sender, messageToReply.index)
                );
                if (isStatusMessage(res)) {
                  setStatusMessage(res);
                }
              }}
            >
              Send Reply
            </Button>

            <Button key={'close'} onClick={done}>
              Close
            </Button>
          </Stack>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
