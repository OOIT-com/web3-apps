import {
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  useTheme
} from '@mui/material';
import * as React from 'react';
import { ChangeEvent, Fragment, useCallback, useEffect, useState } from 'react';
import { infoMessage, isStatusMessage, StatusMessage } from '../../types';
import { grey } from '@mui/material/colors';

import { PrivateMessageNew2Ui } from './PrivateMessageNew2Ui';
import moment from 'moment';
import { AddressDisplayWithAddressBook } from '../common/AddressDisplayWithAddressBook';
import CheckIcon from '@mui/icons-material/Check';
import { PrivateMessageReply2Ui } from './PrivateMessageReply2Ui';
import { Message } from './private-message-store2-types';
import { getNetworkInfo } from '../../network-info';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { useAppContext, WrapFun } from '../AppContextProvider';
import { Web3NotInitialized } from '../common/Web3NotInitialized';
import {
  GetInBoxResult,
  PrivateMessageStoreV2
} from '../../contracts/private-message-store/PrivateMessageStoreV2-support';

type SetMessages = (setMessage: (messages: Message[]) => Message[]) => void;

export function PrivateMessageInBoxV2Ui({
  privateMessageStoreV2
}: Readonly<{ privateMessageStoreV2: PrivateMessageStoreV2 }>) {
  const { wrap, web3Session } = useAppContext();
  const { publicAddress, networkId = 0 } = web3Session || {};
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<GetInBoxResult | 'new'>();
  const [messageToReply, setMessageToReply] = useState<GetInBoxResult | undefined>(undefined);
  const [filterValue, setFilterValue] = useState('');
  const [numberOfEntries, setNumberOfEntries] = useState(-1);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | undefined>();

  const refreshMessages = useCallback(async () => {
    if (publicAddress && web3Session && privateMessageStoreV2) {
      return refreshFromBlockchain(wrap, privateMessageStoreV2, setNumberOfEntries, setMessages);
    }
  }, [publicAddress, web3Session, privateMessageStoreV2, wrap]);

  useEffect(() => {
    refreshMessages().then((res) => (isStatusMessage(res) ? setStatusMessage(res) : ''));
  }, [refreshMessages]);

  if (!publicAddress || !web3Session) {
    return <Web3NotInitialized />;
  }
  const noMessages = numberOfEntries === 0;
  const { name } = getNetworkInfo(networkId);

  return (
    <Stack>
      <StatusMessageElement
        key={'status-message'}
        statusMessage={statusMessage}
        onClose={() => setStatusMessage(undefined)}
      />
      <TableContainer key="table" component={Paper}>
        <Stack
          key={'header'}
          direction={'row'}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          mb={'1em'}
          sx={{ backgroundColor: theme.palette.mode === 'dark' ? grey['900'] : grey.A100 }}
        >
          <TextField
            disabled={noMessages}
            size={'small'}
            label={'Name filter'}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFilterValue(e.target.value)}
            value={filterValue}
          />
          <Button
            onClick={() => {
              setSelectedMessage('new');
            }}
          >
            New Private Message
          </Button>
        </Stack>
        {noMessages ? (
          <StatusMessageElement statusMessage={infoMessage(`No messages yet for you on: ${name}`)} />
        ) : (
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell key={'index'}>Nr</TableCell>
                <TableCell key={'replyIndex'}>Re</TableCell>
                <TableCell key={'sender'}>Sender</TableCell>
                <TableCell key={'subject'}>Subject</TableCell>
                <TableCell key={'inserted'}>Date</TableCell>
                <TableCell key={'confirmed'}>Confirmed</TableCell>
                <TableCell key={'actions'}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {messages
                .filter((row) => !filterValue || row.subject?.toLowerCase().includes(filterValue.toLowerCase()))
                .map((message) => {
                  const { subject, text, displayText, sender, inserted, confirmed, index, replyIndex } = message;
                  const active = displayText && publicAddress && subject && !confirmed;

                  return (
                    <Fragment key={'frag-' + index}>
                      <TableRow key={'row-detail' + index}>
                        <TableCell key={'index'}>{1 + index}</TableCell>
                        <TableCell key={'replyIndex'}>{replyIndex + 1}</TableCell>
                        <TableCell key={'sender'}>
                          <AddressDisplayWithAddressBook address={sender}></AddressDisplayWithAddressBook>
                        </TableCell>
                        <TableCell key={'subject'}>{subject ?? '***'}</TableCell>
                        <TableCell key={'inserted'}>{moment(inserted * 1000).format('YYYY-MM-DD HH:mm')}</TableCell>
                        <TableCell key={'confirmed'}>{confirmed ? <CheckIcon /> : ''}</TableCell>
                        <TableCell key={'actions'}>
                          <Stack direction={'row'}>
                            <DecryptButton
                              address={publicAddress}
                              message={message}
                              setMessages={setMessages}
                              privateMessageStoreV2={privateMessageStoreV2}
                            />
                            <ToggleButton message={message} setMessages={setMessages} />
                            <Button
                              disabled={!active}
                              key={'confirm'}
                              onClick={async () => {
                                if (active) {
                                  const res = await privateMessageStoreV2.confirm(message.index);
                                  if (isStatusMessage(res)) {
                                    setStatusMessage(res);
                                    return;
                                  }
                                  const res2 = await refreshMessages();
                                  if (isStatusMessage(res2)) {
                                    setStatusMessage(res2);
                                  }
                                }
                              }}
                            >
                              confirm
                            </Button>

                            <Button disabled={!subject} onClick={() => setMessageToReply(message)}>
                              reply
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                      {subject && displayText ? (
                        <TableRow key={'row-text-' + index}>
                          <TableCell colSpan={6}>
                            <Box>{text}</Box>
                          </TableCell>
                        </TableRow>
                      ) : (
                        ''
                      )}
                    </Fragment>
                  );
                })}
            </TableBody>
          </Table>
        )}
        <Stack key={'footer'} direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
          <Button
            onClick={async () => {
              const res = await refreshFromBlockchain(wrap, privateMessageStoreV2, setNumberOfEntries, setMessages);
              if (isStatusMessage(res)) {
                setStatusMessage(res);
              }
            }}
          >
            Refresh
          </Button>
        </Stack>
      </TableContainer>
      {selectedMessage === 'new' && (
        <PrivateMessageNew2Ui
          privateMessageStoreV2={privateMessageStoreV2}
          done={() => setSelectedMessage(undefined)}
        />
      )}
      {messageToReply && (
        <PrivateMessageReply2Ui
          privateMessageStoreV2={privateMessageStoreV2}
          messageToReply={messageToReply}
          done={() => setMessageToReply(undefined)}
        />
      )}
    </Stack>
  );
}

async function refreshFromBlockchain(
  wrap: WrapFun,
  privateMessageStoreV2: PrivateMessageStoreV2,
  setNumberOfEntries: (n: number) => void,
  setMessages: SetMessages
): Promise<void | StatusMessage> {
  setMessages(() => []);
  return await wrap('Reading entries...', async () => {
    const len = await privateMessageStoreV2.getInBoxCount();
    if (isStatusMessage(len)) {
      setNumberOfEntries(0);
      return len;
    } else {
      setNumberOfEntries(len);
    }
    const messages: GetInBoxResult[] = [];
    for (let index = 0; index < len; index++) {
      const message = await privateMessageStoreV2.getInBox(index);
      if (isStatusMessage(message)) {
        return message;
      } else {
        messages.push(message);
      }
    }
    setMessages(() => messages);
  });
}

type DecryptButtonProps = {
  address?: string;
  message: Message;
  setMessages: SetMessages;
  privateMessageStoreV2: PrivateMessageStoreV2;
};

function DecryptButton({ address, message, setMessages, privateMessageStoreV2 }: Readonly<DecryptButtonProps>) {
  const active = !!address && !message.subject;
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  return (
    <Stack>
      <Button
        disabled={!active}
        key={'decrypt'}
        onClick={async () => {
          if (active) {
            const text = await privateMessageStoreV2.decryptEncMessage(message.textInBox);
            if (isStatusMessage(text)) {
              setStatusMessage(text);
              return;
            }
            setMessages((messages: Message[]) => {
              const m: Message[] = [...messages];
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

type ToggleButtonProps = { message: Message; setMessages: SetMessages };

function ToggleButton({ message, setMessages }: Readonly<ToggleButtonProps>) {
  return (
    <Button
      disabled={!message.subject}
      key={'toggle'}
      onClick={() =>
        setMessages((messages: Message[]) => {
          const d = [...messages];
          messages[message.index].displayText = !messages[message.index].displayText;
          return d;
        })
      }
    >
      toggle
    </Button>
  );
}
