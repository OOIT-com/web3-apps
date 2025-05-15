import { Box, Button, Stack } from '@mui/material';
import * as React from 'react';
import { FC, useState } from 'react';
import { Message } from './private-message-store2-types';
import { AddressDisplayWithAddressBook } from '../common/AddressDisplayWithAddressBook';
import { ButtonPanel } from '../common/ButtonPanel';
import { NotifyFun } from '../../types';
import { StatusMessageElement } from '../common/StatusMessageElement';
import {StatusMessage} from "../../utils/status-message";

export const MessageDisplay: FC<{
  message: Message;
  text: string;
  confirm: NotifyFun | undefined;
  reply: NotifyFun;
}> = ({ message, text, confirm, reply }) => {
  const [statusMessage, setStatusMessage] = useState<StatusMessage | undefined>();

  const { subjectInBox, sender } = message;

  return (
    <ButtonPanel mode={'left'}>
      <Stack alignItems="flex-start" sx={{ width: '100%' }}>
        <Box key={'sender'}>
          Sender: <AddressDisplayWithAddressBook address={sender}></AddressDisplayWithAddressBook>
        </Box>
        <Box key={'subject'} sx={{ fontWeight: 'bold' }}>
          Subject: {subjectInBox}
        </Box>
        <Box
          key={'text'}
          sx={{
            padding: '1em'
          }}
        >
          {text}
        </Box>
      </Stack>
      <Stack key={'buttons'}>
        {confirm && (
          <Button key={'confirm'} onClick={confirm}>
            confirm
          </Button>
        )}
        <Button key={'reply'} onClick={reply}>
          reply
        </Button>
      </Stack>
      <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />
    </ButtonPanel>
  );
};
