import * as React from 'react';
import { useState } from 'react';
import { isStatusMessage, StatusMessage } from '../../types';
import { Button, Stack } from '@mui/material';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { PrivateMessageStoreV2 } from '../../contracts/private-message-store/PrivateMessageStoreV2-support';
import { OutMessage, SetOutMessages } from './private-message-store2-types';

export type DecryptButtonProps = {
  address?: string;
  message: OutMessage;
  setMessages: SetOutMessages;
  privateMessageStoreV2: PrivateMessageStoreV2;
};

export function DecryptButton2({ address, message, setMessages, privateMessageStoreV2 }: Readonly<DecryptButtonProps>) {
  const active = !!address && !message.subject;
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  return (
    <Stack>
      <Button
        disabled={!active}
        key={'decrypt'}
        onClick={async () => {
          if (active) {
            const text = await privateMessageStoreV2.decryptEncMessage(message.textOutBox);
            if (isStatusMessage(text)) {
              setStatusMessage(text);
              return;
            }
            setMessages((messages: OutMessage[]) => {
              const m: OutMessage[] = [...messages];
              m[message.index] = { ...message, text, displayText: true };
              return m;
            });
          }
        }}
      >
        decrypt
      </Button>
      <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />
    </Stack>
  );
}
