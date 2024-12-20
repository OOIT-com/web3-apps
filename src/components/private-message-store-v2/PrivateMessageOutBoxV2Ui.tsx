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
import { ChangeEvent, Fragment, useEffect, useState } from 'react';
import { infoMessage, isStatusMessage, StatusMessage } from '../../types';
import { grey } from '@mui/material/colors';
import {
  GetOutBoxResult,
  PrivateMessageStoreV2
} from '../../contracts/private-message-store/PrivateMessageStoreV2-support';
import moment from 'moment';
import { AddressDisplayWithAddressBook } from '../common/AddressDisplayWithAddressBook';
import CheckIcon from '@mui/icons-material/Check';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { useAppContext, WrapFun } from '../AppContextProvider';
import { Web3NotInitialized } from '../common/Web3NotInitialized';
import { DecryptButton2 } from './DecryptButton2';
import { OutMessage, SetOutMessages } from './private-message-store2-types';
import { OutMessageDisplay } from './OutMessageDisplay';

export function PrivateMessageOutBoxV2Ui({
  privateMessageStoreV2
}: Readonly<{ privateMessageStoreV2: PrivateMessageStoreV2 }>) {
  const { wrap, web3Session } = useAppContext();
  const { publicAddress } = web3Session || {};
  const theme = useTheme();

  const [outMessages, setOutMessages] = useState<OutMessage[]>([]);
  const [filterValue, setFilterValue] = useState('');
  const [numberOfEntries, setNumberOfEntries] = useState(-1);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | undefined>();

  useEffect(() => {
    if (publicAddress) {
      refreshOutMessages(wrap, publicAddress, setNumberOfEntries, setOutMessages, privateMessageStoreV2).then((res) =>
        isStatusMessage(res) ? setStatusMessage(res) : ''
      );
    }
  }, [wrap, privateMessageStoreV2, publicAddress]);

  if (!web3Session || !publicAddress) {
    return <Web3NotInitialized />;
  }
  const noMessages = numberOfEntries === 0;
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
        </Stack>
        {noMessages ? (
          <StatusMessageElement statusMessage={infoMessage(`No sent messages found!`)} />
        ) : (
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell key={'index'}>Nr</TableCell>
                <TableCell key={'receiver'}>Receiver</TableCell>
                <TableCell key={'subject'}>Subject</TableCell>
                <TableCell key={'inserted'}>Date</TableCell>
                <TableCell key={'confirmed'}>Confirmed</TableCell>
                <TableCell key={'actions'}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {outMessages
                .filter((row) => !filterValue || row.subject?.toLowerCase().includes(filterValue.toLowerCase()))
                .reverse()
                .map((message, index) => (
                  <Fragment key={'frag-' + index}>
                    <TableRow key={'row-detail' + message.index}>
                      <TableCell key={'index'}>{1 + index}</TableCell>
                      <TableCell key={'receiver'}>
                        <AddressDisplayWithAddressBook address={message.receiver}></AddressDisplayWithAddressBook>
                      </TableCell>
                      <TableCell key={'subject'}>{message.subjectOutBox}</TableCell>
                      <TableCell key={'inserted'}>
                        {moment(message.inserted * 1000).format('YYYY-MM-DD HH:mm')}
                      </TableCell>
                      <TableCell key={'confirmed'}>{message.confirmed ? <CheckIcon /> : ''}</TableCell>
                      <TableCell key={'actions'}>
                        <Stack direction={'row'}>
                          <DecryptButton2
                            address={publicAddress}
                            message={message}
                            setMessages={setOutMessages}
                            privateMessageStoreV2={privateMessageStoreV2}
                          />
                          <ToggleButton message={message} setMessages={setOutMessages} />
                        </Stack>
                      </TableCell>
                    </TableRow>
                    {message.text && message.displayText ? (
                      <TableRow key={'row-text' + message.index}>
                        <TableCell colSpan={6}>
                          <OutMessageDisplay message={message} text={message.text} />
                        </TableCell>
                      </TableRow>
                    ) : (
                      ''
                    )}
                  </Fragment>
                ))}
            </TableBody>
          </Table>
        )}
        <Stack key={'footer'} direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
          <StatusMessageElement statusMessage={statusMessage} />
          <Button
            onClick={async () => {
              const res = await refreshOutMessages(
                wrap,
                publicAddress,
                setNumberOfEntries,
                setOutMessages,
                privateMessageStoreV2
              );
              if (isStatusMessage(res)) {
                setStatusMessage(res);
              }
            }}
          >
            Refresh
          </Button>
        </Stack>
      </TableContainer>
    </Stack>
  );
}

const refreshOutMessages = (
  wrap: WrapFun,
  publicAddress: string,
  setNumberOfEntries: (n: number) => void,
  setOutMessages: SetOutMessages,
  privateMessageStoreV2: PrivateMessageStoreV2
): Promise<StatusMessage | void> =>
  wrap('Reading Sent Messages...', async () => {
    setOutMessages(() => []);
    const len = await privateMessageStoreV2.getOutBoxCount();
    if (isStatusMessage(len)) {
      return len;
    } else {
      setNumberOfEntries(len);
    }
    const messages: GetOutBoxResult[] = [];
    for (let index = 0; index < len; index++) {
      const message = await privateMessageStoreV2.getOutBox(index);
      if (isStatusMessage(message)) {
        return message;
      } else {
        messages.push(message);
      }
    }
    setOutMessages(() => messages);
  });

type ToggleButtonProps = { message: OutMessage; setMessages: SetOutMessages };

function ToggleButton({ message, setMessages }: Readonly<ToggleButtonProps>) {
  return (
    <Button
      disabled={!message.subject}
      key={'toggle'}
      onClick={() =>
        setMessages((messages: OutMessage[]) => {
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
