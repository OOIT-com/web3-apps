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
import { ChangeEvent, Fragment, useEffect, useState } from 'react';
import { infoMessage, isStatusMessage, StatusMessage } from '../../types';
import { grey } from '@mui/material/colors';
import {
  GetOutBoxResult,
  PrivateMessageStore
} from '../../contracts/private-message-store/PrivateMessageStore-support';
import moment from 'moment';
import { AddressDisplayWithAddressBook } from '../common/AddressDisplayWithAddressBook';
import CheckIcon from '@mui/icons-material/Check';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { decryptKeyBlockValue } from '../key-block/key-block-utils';
import { DecryptFun } from '../connect-with-localstore';
import { useAppContext, WrapFun } from '../AppContextProvider';
import { Web3NotInitialized } from '../common/Web3NotInitialized';

type OutMessage = GetOutBoxResult & { subject?: string; text?: string; displayText?: boolean };
type SetOutMessages = (setMessage: (messages: OutMessage[]) => OutMessage[]) => void;

export function PrivateMessageOutBoxUi({
  privateMessageStore
}: Readonly<{ privateMessageStore: PrivateMessageStore }>) {
  const { wrap, web3Session } = useAppContext();
  const { publicAddress } = web3Session || {};
  const theme = useTheme();

  const [outMessages, setOutMessages] = useState<OutMessage[]>([]);
  const [filterValue, setFilterValue] = useState('');
  const [numberOfEntries, setNumberOfEntries] = useState(-1);

  useEffect(() => {
    if (publicAddress) {
      const load = async () => {
        await refreshOutMessages(wrap, publicAddress, setNumberOfEntries, setOutMessages, privateMessageStore);
      };
      load().catch(console.error);
    }
  }, [wrap, privateMessageStore, publicAddress]);

  if (!web3Session || !publicAddress) {
    return <Web3NotInitialized />;
  }
  const { decryptFun } = web3Session;
  let statusMessage: StatusMessage | undefined = undefined;
  const noMessages = numberOfEntries === 0;
  return (
    <Stack>
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
                .map((row, index) => (
                  <Fragment key={'frag-' + index}>
                    <TableRow key={'row-detail' + row.index}>
                      <TableCell key={'index'}>{1 + index}</TableCell>
                      <TableCell key={'receiver'}>
                        <AddressDisplayWithAddressBook address={row.receiver}></AddressDisplayWithAddressBook>
                      </TableCell>
                      <TableCell key={'subject'}>{row.subject ? row.subject : '***'}</TableCell>
                      <TableCell key={'inserted'}>{moment(row.inserted * 1000).format('YYYY-MM-DD HH:mm')}</TableCell>
                      <TableCell key={'confirmed'}>{row.confirmed ? <CheckIcon /> : ''}</TableCell>
                      <TableCell key={'actions'}>
                        <Stack direction={'row'}>
                          <DecryptButton
                            address={publicAddress}
                            message={row}
                            setMessages={setOutMessages}
                            decryptFun={decryptFun}
                          />
                          <ToggleButton message={row} setMessages={setOutMessages} />
                        </Stack>
                      </TableCell>
                    </TableRow>
                    {row.subject && row.displayText ? (
                      <TableRow key={'row-text' + row.index}>
                        <TableCell colSpan={6}>
                          <Box>{row.text}</Box>
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
            onClick={() => {
              refreshOutMessages(wrap, publicAddress, setNumberOfEntries, setOutMessages, privateMessageStore).catch(
                console.error
              );
            }}
          >
            Refresh
          </Button>
        </Stack>
      </TableContainer>
    </Stack>
  );
}

async function refreshOutMessages(
  wrap: WrapFun,
  publicAddress: string,
  setNumberOfEntries: (n: number) => void,
  setOutMessages: SetOutMessages,
  privateMessageStore: PrivateMessageStore
): Promise<StatusMessage | void> {
  setOutMessages(() => []);

  return await wrap('Reading Sent Messages...', async () => {
    const len = await privateMessageStore.lenOutBox(publicAddress);
    if (isStatusMessage(len)) {
      setNumberOfEntries(0);
      console.error(len);
      return;
    } else {
      setNumberOfEntries(len);
    }
    const messages: GetOutBoxResult[] = [];
    for (let index = 0; index < len; index++) {
      const message = await privateMessageStore.getOutBox(publicAddress, index);
      if (isStatusMessage(message)) {
        console.error(message);
        return;
      } else {
        messages.push(message);
      }
    }
    setOutMessages(() => messages);
  });
}

type DecryptButtonProps = {
  address?: string;
  message: OutMessage;
  setMessages: SetOutMessages;
  decryptFun: DecryptFun | undefined;
};

function DecryptButton({ address, message, setMessages, decryptFun }: Readonly<DecryptButtonProps>) {
  const active = !!address && !message.subject;
  return (
    <Button
      disabled={!active}
      key={'decrypt'}
      onClick={async () => {
        if (active) {
          try {
            const inBoxOpened = await decryptKeyBlockValue(message.subjectOutBox + message.textOutBox, decryptFun);
            if (isStatusMessage(inBoxOpened)) {
              console.error(inBoxOpened);
            } else {
              setMessages((messages: OutMessage[]) => {
                const m: OutMessage[] = [...messages];
                m[message.index] = { ...message, ...inBoxOpened, displayText: true };
                return m;
              });
            }
          } catch (e) {
            console.error(e);
          }
        }
      }}
    >
      Decrypt
    </Button>
  );
}

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
