import * as React from 'react';
import { ChangeEvent, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { errorMessage, infoMessage, isStatusMessage, NotifyFun, StatusMessage } from '../../types';
import { Autocomplete, Box, Stack } from '@mui/material';
import { PrivateMessageStore } from '../../contracts/private-message-store/PrivateMessageStore-support';
import { displayAddress } from '../../utils/misc-util';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { getPublicKeyStore, PublicKeyStore } from '../../contracts/public-key-store/PublicKeyStore-support';
import { resolveAsStatusMessage } from '../../utils/status-message-utils';

import { createInAndOutBox } from './private-message-store-utils';
import { AddressData } from '../../contracts/address-book/AddressBook-support';
import { useAppContext, WrapFun } from '../AppContextProvider';

const receiverDisplay = (e: AddressData): string => `${e.name} ${displayAddress(e.userAddress)}`;

export function PrivateMessageNewUi({
  done,
  privateMessageStore
}: Readonly<{
  done: NotifyFun;
  privateMessageStore: PrivateMessageStore;
}>) {
  const { wrap, web3Session, addressData = [] } = useAppContext();
  const { web3, publicAddress, publicKeyHolder } = web3Session || {};
  const { publicKey } = publicKeyHolder || {};
  const [receiverContent, setReceiverContent] = useState('');
  const [receiver, setReceiver] = useState('');
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [statusMessage, setStatusMessage] = useState<StatusMessage | undefined>();

  useEffect(() => {
    const index = addressData.findIndex((e) => receiverDisplay(e) === receiverContent);
    setReceiver(index === -1 ? receiverContent : addressData[index].userAddress);
  }, [receiverContent, addressData]);
  const publicKeyStore = getPublicKeyStore();

  if (!web3 || !publicAddress || !publicKey || !publicKeyStore) {
    console.error(`Web3, publicAddress or publicKey is missing. Can not open New Private Message!`);
    return <></>;
  }

  return (
    <Dialog open={true} onClose={done} fullWidth={true} maxWidth={'md'}>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={2}>
          <Box>New Message</Box>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={4}>
          <Autocomplete
            onChange={(_, newValue) => {
              setReceiverContent((newValue as string) ?? '');
            }}
            onInputChange={(_, newInputValue) => {
              setReceiverContent(newInputValue || '');
            }}
            freeSolo
            options={addressData.map((e) => receiverDisplay(e))}
            renderInput={(params) => (
              <TextField
                {...params}
                margin="dense"
                variant="standard"
                label="Receiver"
                helperText={
                  <Box component={'span'} sx={{ color: 'darkgreen', fontStyle: 'italic', fontWeight: '800' }}>
                    {receiver}
                  </Box>
                }
              />
            )}
          ></Autocomplete>

          <TextField
            key={'subject'}
            autoFocus
            margin="dense"
            value={subject}
            label="Subject"
            fullWidth
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
            variant="standard"
          />
          <TextField
            key={'text'}
            autoFocus
            margin="dense"
            value={text}
            label="Message Text"
            fullWidth
            onChange={(e: ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
            variant="standard"
          />
          <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ height: '4em' }}>
          <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
            <Button
              disabled={!subject || !text}
              onClick={async () => {
                setStatusMessage(undefined);
                const res = await sendPrivateMessage({
                  wrap,
                  publicAddress,
                  publicKey,
                  receiver,
                  subject,
                  text,
                  privateMessageStore,
                  publicKeyStore
                });
                setStatusMessage(res);
              }}
            >
              Send Message
            </Button>

            <Button onClick={done}>Close</Button>
          </Stack>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

export type SendPrivateMessageArgs = {
  wrap: WrapFun;
  publicAddress: string;
  publicKey: string;
  receiver: string;
  subject: string;
  text: string;
  privateMessageStore: PrivateMessageStore;
  publicKeyStore: PublicKeyStore;
};

export async function sendPrivateMessage({
  wrap,
  publicAddress,
  publicKey,
  receiver,
  subject,
  text,
  privateMessageStore,
  publicKeyStore
}: SendPrivateMessageArgs) {
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
    return wrap('Store Message...', async () => {
      try {
        const res = await privateMessageStore.send(publicAddress, {
          address: receiver,
          subjectInBox: inBox.subjectEnc,
          textInBox: inBox.textEnc,
          subjectOutBox: outBox.subjectEnc,
          textOutBox: outBox.textEnc,
          contentHash
        });
        if (isStatusMessage(res)) {
          return res;
        }
        return infoMessage(`Message ${subject} successfully sent!`);
      } catch (e) {
        return resolveAsStatusMessage('Could not send message not successful!', e);
      }
    });
  } else {
    return errorMessage('Could not send message. Keys are missing!');
  }
}
