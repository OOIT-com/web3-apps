import * as React from 'react';
import { FC, useState } from 'react';
import { isStatusMessage, StatusMessage } from '../../types';
import { Button, Stack } from '@mui/material';
import { DecryptedDataList, Message, SetDecryptedDataList } from './private-message-store2-types';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { PrivateMessageStoreV2 } from '../../contracts/private-message-store/PrivateMessageStoreV2-support';

export type OpenInboxMessageButtonProps = {
  sender: string;
  message: Message;
  setDecryptedDataList: SetDecryptedDataList;
  decryptedDataList: DecryptedDataList;
  privateMessageStoreV2: PrivateMessageStoreV2;
};
export const OpenInboxMessageButton: FC<OpenInboxMessageButtonProps> = ({
  sender,
  message,
  decryptedDataList,
  setDecryptedDataList,
  privateMessageStoreV2
}) => {
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  return (
    <Stack>
      <Button
        key={'open'}
        onClick={async () => {
          const dd = decryptedDataList[message.index];

          if (!dd) {
            const text = await privateMessageStoreV2.decryptEncMessage(message.textInBox, sender);
            if (isStatusMessage(text)) {
              setStatusMessage(text);
              return;
            }
            setDecryptedDataList((ddList: DecryptedDataList) => {
              const newList = [...ddList];
              const dd = newList[message.index];
              if (!dd) {
                newList[message.index] = { text, displayText: true };
              } else {
                newList[message.index] = { ...dd, displayText: !dd.displayText };
              }
              return newList;
            });
            return;
          } else {
            setDecryptedDataList((ddList: DecryptedDataList) => {
              const newList = [...ddList];
              const dd = newList[message.index];
              if (dd) {
                newList[message.index] = { ...dd, displayText: !dd.displayText };
              }
              return newList;
            });
          }
        }}
      >
        open
      </Button>
      <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />
    </Stack>
  );
};
