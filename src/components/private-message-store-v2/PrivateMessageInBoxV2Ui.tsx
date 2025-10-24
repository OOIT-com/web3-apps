import {
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
import { grey } from '@mui/material/colors';

import { PrivateMessageNew2Ui } from './PrivateMessageNew2Ui';
import moment from 'moment';
import { AddressDisplayWithAddressBook } from '../common/AddressDisplayWithAddressBook';
import CheckIcon from '@mui/icons-material/Check';
import { PrivateMessageReply2Ui } from './PrivateMessageReply2Ui';
import { DecryptedDataList } from './private-message-store2-types';
import { getNetworkInfo } from '../../network-info';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { useAppContext, WrapFun } from '../AppContextProvider';
import { Web3NotInitialized } from '../common/Web3NotInitialized';
import {
  GetInBoxResult,
  PrivateMessageStoreV2
} from '../../contracts/private-message-store/PrivateMessageStoreV2-support';
import { MessageDisplay } from './MessageDisplay';
import { OpenInboxMessageButton } from './OpenInboxMessageButton';
import { infoMessage, isStatusMessage, StatusMessage } from '../../utils/status-message';

export function PrivateMessageInBoxV2Ui({
  privateMessageStoreV2
}: Readonly<{ privateMessageStoreV2: PrivateMessageStoreV2 }>) {
  const { wrap, web3Session } = useAppContext();
  const { publicAddress, chainId = 0 } = web3Session || {};
  const theme = useTheme();
  const [messages, setMessages] = useState<GetInBoxResult[]>([]);
  const [decryptedDataList, setDecryptedDataList] = useState<DecryptedDataList>([]);
  const [selectedMessage, setSelectedMessage] = useState<GetInBoxResult | 'new'>();
  const [messageToReply, setMessageToReply] = useState<GetInBoxResult | undefined>(undefined);
  const [filterValue, setFilterValue] = useState('');
  const [statusMessage, setStatusMessage] = useState<StatusMessage | undefined>();

  const refreshMessages = useCallback(async () => {
    if (publicAddress && web3Session && privateMessageStoreV2) {
      const res = await refreshInboxMessages(wrap, privateMessageStoreV2);
      if (isStatusMessage(res)) {
        setStatusMessage(res);
        setMessages([]);
      } else {
        setMessages(res);
      }
    }
  }, [publicAddress, web3Session, privateMessageStoreV2, wrap]);

  useEffect(() => {
    refreshMessages().then((res) => (isStatusMessage(res) ? setStatusMessage(res) : ''));
  }, [refreshMessages]);

  if (!publicAddress || !web3Session) {
    return <Web3NotInitialized />;
  }
  const noMessages = messages.length === 0;
  const { name } = getNetworkInfo(chainId);

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
                <TableCell key={'actions'}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {messages
                .filter((row) => !filterValue || row.subjectInBox?.toLowerCase().includes(filterValue.toLowerCase()))
                .reverse()
                .map((message) => {
                  const { sender, inserted, confirmed, index, replyIndex, subjectInBox } = message;

                  const dd = decryptedDataList[index];
                  const { text, displayText } = dd || {};
                  const active = displayText && publicAddress && subjectInBox && !confirmed;
                  return (
                    <Fragment key={'frag-' + index}>
                      <TableRow key={'row-detail' + index}>
                        <TableCell key={'index'}>{1 + index}</TableCell>
                        <TableCell key={'replyIndex'}>{replyIndex + 1}</TableCell>
                        <TableCell key={'sender'}>
                          <AddressDisplayWithAddressBook address={sender}></AddressDisplayWithAddressBook>
                        </TableCell>
                        <TableCell key={'subject'}>{subjectInBox}</TableCell>
                        <TableCell key={'inserted'}>{moment(inserted * 1000).format('YYYY-MM-DD HH:mm')}</TableCell>
                        <TableCell key={'confirmed'}>{confirmed ? <CheckIcon /> : ''}</TableCell>
                        <TableCell key={'actions'}>
                          <Stack direction={'row'}>
                            <OpenInboxMessageButton
                              sender={sender}
                              message={message}
                              setDecryptedDataList={setDecryptedDataList}
                              privateMessageStoreV2={privateMessageStoreV2}
                              decryptedDataList={decryptedDataList}
                            />
                          </Stack>
                        </TableCell>
                      </TableRow>
                      {text && displayText ? (
                        <TableRow key={'row-text-' + index}>
                          <TableCell colSpan={7} sx={{ backgroundColor: '#5294d524' }}>
                            <MessageDisplay
                              message={message}
                              text={text}
                              confirm={
                                active
                                  ? async () => {
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
                                    }
                                  : undefined
                              }
                              reply={() => setMessageToReply(message)}
                            />
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
          <Button onClick={() => refreshMessages()}>Refresh</Button>
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

export async function refreshInboxMessages(
  wrap: WrapFun,
  privateMessageStoreV2: PrivateMessageStoreV2
): Promise<GetInBoxResult[] | StatusMessage> {
  return await wrap('Reading in box entries...', async () => {
    const len = await privateMessageStoreV2.getInBoxCount();
    if (isStatusMessage(len)) {
      return len;
    }
    const messages: GetInBoxResult[] = [];
    for (let index = 0; index < len; index++) {
      const message = await privateMessageStoreV2.getInBoxEntry(index);
      if (isStatusMessage(message)) {
        return message;
      } else {
        messages.push(message);
      }
    }
    return messages;
  });
}
