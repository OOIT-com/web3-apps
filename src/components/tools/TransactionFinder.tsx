import * as React from 'react';
import { ChangeEvent, useState } from 'react';
import { Box, Button, Paper, Stack, Table, TableBody, TextField, Tooltip } from '@mui/material';
import { StyledHead } from '../common/StyledHead';
import Web3 from 'web3';
import { TableRowComp } from '../common/TableRowComp';
import { artworkTimeProofAbi } from '../../contracts/artwork-time-proof/ArtworkTimeProof';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { useAppContext } from '../AppContextProvider';
import { errorMessage, isStatusMessage, StatusMessage } from '../../shared/status-message';

const contractAddress0 = '0x738dBFC759B7937244AC69737445051102f8f1E8';
const eventName0 = 'VerifiedAddressAdded';
const contractABI0 = JSON.stringify(artworkTimeProofAbi);

type Transaction = {
  amount: number;
  date: string;
};

export function TransactionFinder() {
  const { wrap, web3Session } = useAppContext();
  const { web3 } = web3Session || {};
  const [contractAddress, setContractAddress] = useState(contractAddress0);
  const [contractABI, setContractABI] = useState(contractABI0);
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();

  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [transactions, setTransactions] = useState<never[]>([]);

  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ borderBottom: 'solid 2px gray' }}
      >
        <StyledHead>Transaction Finder</StyledHead>

        <Stack direction={'row'}>
          <Tooltip title={'Look up Transactions'}>
            <Button
              disabled={!contractAddress}
              key={'deploy'}
              onClick={async () => {
                if (web3 && contractAddress && contractABI && (fromAddress || toAddress)) {
                  setStatusMessage(undefined);
                  const transactions = await wrap('Looking up Transactions...', () =>
                    getTransactions({
                      fromAddress,
                      toAddress,
                      fromDate,
                      toDate,
                      web3
                    })
                  );
                  if (isStatusMessage(transactions)) {
                    setStatusMessage(transactions);
                  } else {
                    setTransactions(transactions);
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
        key={'fromAddress'}
        value={fromAddress}
        placeholder={'From Address'}
        fullWidth={true}
        size={'small'}
        label={'From Address'}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setFromAddress(e.target.value)}
      />
      <TextField
        key={'toAddress'}
        value={toAddress}
        placeholder={'To Address'}
        fullWidth={true}
        size={'small'}
        label={'To Address'}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setToAddress(e.target.value)}
      />
      <TextField
        key={'fromDate'}
        value={fromDate}
        fullWidth={true}
        size={'small'}
        label={'From Date'}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setFromDate(e.target.value)}
      />
      <TextField
        key={'toDate'}
        value={toDate}
        placeholder={'0x...'}
        fullWidth={true}
        size={'small'}
        label={'To Date'}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setToDate(e.target.value)}
      />{' '}
      {transactions && <TransactionsDisplay transactions={transactions} />}
    </Stack>
  );
}

function TransactionsDisplay({ transactions }: Readonly<{ transactions: never[] }>) {
  if (Array.isArray(transactions)) {
    return (
      <Paper elevation={6} sx={{ padding: '1em' }}>
        <Stack direction={'column'}>
          <Box sx={{ padding: '1em 0 1em 0', fontSize: '1.2em' }}>{`Nr of Transaction ${transactions.length}`}</Box>
          {transactions.map((tx: Transaction, index) => {
            const amount = (tx as Transaction).amount;
            const date = (tx as Transaction).date;

            const keys = Object.keys(amount);
            return (
              <Stack key={'i' + index.toString()} direction={'row'} spacing={2}>
                <Box sx={{ whiteSpace: 'nowrap' }}>#{index + 1}</Box>
                <Table>
                  <TableBody>
                    <TableRowComp key={date} elements={[date, amount]} />
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

  return <Stack>{JSON.stringify(transactions)}</Stack>;
}

async function getTransactions({
  fromAddress,
  toAddress,
  fromDate,
  toDate,
  web3
}: {
  fromAddress: string;
  toAddress: string;
  fromDate: string;
  toDate: string;
  web3: Web3;
}) {
  try {
   const fromBlock = 'earliest';
 const toBlock = 'latest';

    const txs = await web3.eth.getPastLogs({
      fromBlock,
      toBlock
      // NOTE: getPastLogs only gives logs, not native ETH transfers.
      // For native ETH transfers use explorer API or block scanning.
    });


    // const contract = new Contract(JSON.parse(contractABI), contractAddress, web3);
    // const fromBlock = 0; // Start from the first block
    // const toBlock = 'latest'; // Retrieve events up to the latest block
    // const eventFilter = {
    //   fromBlock,
    //   toBlock,
    //   address: contractAddress // Filter events from the specified contract address
    // };
    //
    // const events = await contract.getPastEvents(eventName, eventFilter);
    //
    // console.log('Events:', events);
    //
    // if (events) {
    //   return events;
    // } else {
    //   return errorMessage('No Events found!');
    // }
  } catch (e) {
    return errorMessage('Looking for transaction failed!', e);
  }
  return [];
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
