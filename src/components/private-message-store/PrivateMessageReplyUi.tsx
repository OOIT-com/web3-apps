import * as React from 'react';
import { ChangeEvent, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { errorMessage, infoMessage, isStatusMessage, NotifyFun, StatusMessage } from '../../types';
import { Box, Paper, Stack } from '@mui/material';
import { PrivateMessageStore } from '../../contracts/private-message-store/PrivateMessageStore-support';
import { AddressDisplayWithAddressBook } from '../common/AddressDisplayWithAddressBook';
import { Message } from './private-message-store-types';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { getPublicKeyStore, PublicKeyStore } from '../../contracts/public-key-store/PublicKeyStore-support';
import { createInAndOutBox } from './private-message-store-utils';
import { useAppContext, WrapFun } from '../AppContextProvider';

export function PrivateMessageReplyUi({
  messageToReply,
  done,
  privateMessageStore
}: Readonly<{
  messageToReply: Message;
  done: NotifyFun;
  privateMessageStore: PrivateMessageStore;
}>) {
  const { wrap, web3Session } = useAppContext();
  const { web3, publicAddress, publicKeyHolder } = web3Session || {};
  const { publicKey } = publicKeyHolder || {};
  const [subject, setSubject] = useState('Re:' + messageToReply.subject);
  const [text, setText] = useState('');
  const [statusMessage, setStatusMessage] = useState<StatusMessage | undefined>();

  const publicKeyStore = getPublicKeyStore();
  if (!web3 || !publicAddress || !publicKey || !publicKeyStore) {
    console.error(`Web3, publicAddress or publicKey is missing. Can not open Private Message Reply!`);
    return <></>;
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
                  replyPrivateMessage({
                    wrap,
                    publicAddress,
                    publicKey,
                    receiver: messageToReply.sender,
                    subject,
                    text,
                    replyIndex: messageToReply.index,
                    privateMessageStore,
                    publicKeyStore
                  })
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

export type ReplyPrivateMessageArgs = {
  wrap: WrapFun;
  publicAddress: string;
  publicKey: string;
  receiver: string;
  subject: string;
  text: string;
  replyIndex: number;
  privateMessageStore: PrivateMessageStore;
  publicKeyStore: PublicKeyStore;
};

export async function replyPrivateMessage({
  wrap,
  publicAddress,
  publicKey,
  receiver,
  subject,
  text,
  replyIndex,
  privateMessageStore,
  publicKeyStore
}: ReplyPrivateMessageArgs): Promise<StatusMessage> {
  if (publicAddress && publicKey) {
    const res = await createInAndOutBox({
      wrap,
      subject,
      text,
      publicKey,
      publicKeyStore,
      privateMessageStore,
      receiver
    });
    if (isStatusMessage(res)) {
      return res;
    }
    const { inBox, outBox, contentHash } = res;
    try {
      const res = await privateMessageStore.reply(publicAddress, {
        address: receiver,
        replySubjectInBox: inBox.subjectEnc,
        replyTextInBox: inBox.textEnc,
        replySubjectOutBox: outBox.subjectEnc,
        replyTextOutBox: outBox.textEnc,
        contentHash,
        replyIndex
      });
      if (isStatusMessage(res)) {
        return res;
      }
      return infoMessage(`Message ${subject} successfully sent!`);
    } catch (e) {
      return errorMessage('Save not successful!', e);
    } finally {
      // TODO setLoading('');
    }
  } else {
    return errorMessage('No read yet...!');
  }
}
