import { DecryptFun } from '../connect-with-localstore';
import * as React from 'react';
import { useState } from 'react';
import { errorMessage, isStatusMessage, StatusMessage } from '../../types';
import { Button, Stack } from '@mui/material';
import { decryptKeyBlockValue } from '../key-block/key-block-utils';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { OutMessage, SetOutMessages } from './PrivateMessageOutBoxUi';

export type DecryptButtonProps = {
  address?: string;
  message: OutMessage;
  setMessages: SetOutMessages;
  decryptFun: DecryptFun | undefined;
};

export function DecryptButton({ address, message, setMessages, decryptFun }: Readonly<DecryptButtonProps>) {
  const active = !!address && !message.subject;
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  return (
    <Stack>
      <Button
        disabled={!active}
        key={'decrypt'}
        onClick={async () => {
          if (active) {
            try {
              const inBoxOpened = await decryptKeyBlockValue(message.subjectOutBox + message.textOutBox, decryptFun);
              if (isStatusMessage(inBoxOpened)) {
                return inBoxOpened;
              } else {
                setMessages((messages: OutMessage[]) => {
                  const m: OutMessage[] = [...messages];
                  m[message.index] = { ...message, ...inBoxOpened, displayText: true };
                  return m;
                });
              }
            } catch (e) {
              setStatusMessage(errorMessage('Decryption failed', e));
            }
          }
        }}
      >
        Decrypt
      </Button>
      <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />
    </Stack>
  );
}
