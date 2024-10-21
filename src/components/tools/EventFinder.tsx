import * as React from 'react';
import { ChangeEvent, useState } from 'react';
import { Box, Button, Paper, Stack, Table, TableBody, TextField, Tooltip } from '@mui/material';
import { StyledHead } from '../common/StyledHead';
import { errorMessage, isStatusMessage, StatusMessage } from '../../types';
import { Contract } from 'web3-eth-contract';
import Web3, { EventLog } from 'web3';
import { TableRowComp } from '../common/TableRowComp';
import { artworkTimeProofAbi } from '../../contracts/artwork-time-proof/ArtworkTimeProof';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { useAppContext } from '../AppContextProvider';

const contractAddress0 = '0x738dBFC759B7937244AC69737445051102f8f1E8';
const eventName0 = 'VerifiedAddressAdded';
const contractABI0 = JSON.stringify(artworkTimeProofAbi);

export function EventFinder() {
  const { wrap, web3Session } = useAppContext();
  const { web3 } = web3Session || {};
  const [eventName, setEventName] = useState(eventName0);
  const [contractAddress, setContractAddress] = useState(contractAddress0);
  const [contractABI, setContractABI] = useState(contractABI0);
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();

  const [events, setEvents] = useState<(string | EventLog)[]>();

  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ borderBottom: 'solid 2px gray' }}
      >
        <StyledHead>Event Finder</StyledHead>

        <Stack direction={'row'}>
          <Tooltip title={'Look up events for by contract and event name...'}>
            <Button
              disabled={!contractAddress}
              key={'deploy'}
              onClick={async () => {
                if (web3 && contractAddress && contractABI && eventName) {
                  setStatusMessage(undefined);
                  const events = await wrap('Looking up Events...', () =>
                    getEvents({
                      web3,
                      contractAddress,
                      eventName,
                      contractABI
                    })
                  );
                  if (isStatusMessage(events)) {
                    setStatusMessage(events);
                  } else {
                    setEvents(events);
                  }
                }
              }}
            >
              Lookup Events
            </Button>
          </Tooltip>
        </Stack>
      </Stack>
      <StatusMessageElement statusMessage={statusMessage} />

      <TextField
        key={'event-name'}
        value={eventName}
        placeholder={'Event Name'}
        fullWidth={true}
        size={'small'}
        label={'Event Name'}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setEventName(e.target.value)}
      />
      <TextField
        key={'contractAddress'}
        value={contractAddress}
        placeholder={'0x...'}
        fullWidth={true}
        size={'small'}
        label={'Contract Address'}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setContractAddress(e.target.value)}
      />
      <TextField
        key={'contractABI'}
        value={contractABI}
        placeholder={'Contract ABI'}
        fullWidth={true}
        multiline={true}
        maxRows={6}
        size={'small'}
        label={'Contract ABI'}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setContractABI(e.target.value)}
      />
      {events && <EventsDisplay events={events} />}
    </Stack>
  );
}

function EventsDisplay({ events }: Readonly<{ events: any[] }>) {
  if (Array.isArray(events)) {
    return (
      <Paper elevation={6} sx={{ padding: '1em' }}>
        <Stack direction={'column'}>
          <Box sx={{ padding: '1em 0 1em 0', fontSize: '1.2em' }}>{`Nr of Event ${events.length}`}</Box>
          {events.map((event, index) => {
            const returnValues = event.returnValues;
            if (!returnValues) {
              return <Box>{'No Events found!'}</Box>;
            }
            const keys = Object.keys(returnValues);
            return (
              <Stack key={'i' + index.toString()} direction={'row'} spacing={2}>
                <Box sx={{ whiteSpace: 'nowrap' }}>#{index + 1}</Box>
                <Table>
                  <TableBody>
                    {keys.map(
                      (k) => isReturnKey(k) && <TableRowComp key={k} elements={[k, returnValues[k].toString()]} />
                    )}
                  </TableBody>
                </Table>
              </Stack>
            );
          })}
        </Stack>
      </Paper>
    );
  } else {
    <></>;
  }

  return <Stack>{JSON.stringify(events)}</Stack>;
}

async function getEvents({
  web3,
  contractAddress,
  contractABI,
  eventName
}: {
  web3: Web3;
  contractAddress: string;
  contractABI: string;
  eventName: string;
}) {
  try {
    const contract = new Contract(JSON.parse(contractABI), contractAddress, web3);
    const fromBlock = 0; // Start from the first block
    const toBlock = 'latest'; // Retrieve events up to the latest block
    const eventFilter = {
      fromBlock,
      toBlock,
      address: contractAddress // Filter events from the specified contract address
    };

    const events = await contract.getPastEvents(eventName, eventFilter);

    console.log('Events:', events);

    if (events) {
      return events;
    } else {
      return errorMessage('No Events found!');
    }
  } catch (e) {
    return errorMessage('Looking for events failed!', e);
  }
}

type RValues = { values: { name: string; value: string }[]; blocknumber: string };

function isReturnKey(event: any): RValues {
  const keys = Object.keys(event.returnValues);
  const values: any[] = [];
  keys.forEach((key) => {
    if (+key > -1 || key === '__length__') {
      return;
    }
    values.push({ name: key, value: event.returnValues[key].toString() });
  });

  const blocknumber = event.blocknumber;

  return { values, blocknumber };
}
