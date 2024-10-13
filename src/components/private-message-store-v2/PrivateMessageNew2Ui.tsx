import * as React from 'react';
import { ChangeEvent, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { isStatusMessage, NotifyFun, StatusMessage } from '../../types';
import { Box, Stack } from '@mui/material';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { getPublicKeyStore } from '../../contracts/public-key-store/PublicKeyStore-support';
import { useAppContext } from '../AppContextProvider';
import { Web3NotInitialized } from '../common/Web3NotInitialized';
import { PrivateMessageStoreV2 } from '../../contracts/private-message-store/PrivateMessageStoreV2-support';
import { AddressEntryField } from '../address-book/AddressEntryField';

//const receiverDisplay = (e: AddressData): string => `${e.name} ${displayAddress(e.userAddress)}`;

export function PrivateMessageNew2Ui({
  done,
  privateMessageStoreV2
}: Readonly<{
  done: NotifyFun;
  privateMessageStoreV2: PrivateMessageStoreV2;
}>) {
  const { wrap, web3Session } = useAppContext();
  const { web3, publicAddress, publicKeyHolder } = web3Session || {};
  const { publicKey } = publicKeyHolder || {};
  const [receiver, setReceiver] = useState('');
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [statusMessage, setStatusMessage] = useState<StatusMessage | undefined>();

  // useEffect(() => {
  //   const index = addressData.findIndex((e) => receiverDisplay(e) === receiverContent);
  //   setReceiver(index === -1 ? receiverContent : addressData[index].userAddress);
  // }, [receiverContent, addressData]);
  const publicKeyStore = getPublicKeyStore();

  if (!web3 || !publicAddress || !publicKey || !publicKeyStore) {
    return <Web3NotInitialized />;
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
          <AddressEntryField address={receiver} setAddress={setReceiver} label={'Receiver'} />

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
                const res = await wrap(`Send message: ${subject} ...`, async () =>
                  privateMessageStoreV2.sendMessage(subject, text, receiver)
                );
                if (isStatusMessage(res)) {
                  setStatusMessage(res);
                }
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
