import { Button, Stack, Table, TableBody, TableHead } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { infoMessage, isStatusMessage, StatusMessage } from '../../types';
import { LDBox } from '../common/StyledBoxes';
import TableRowComp from '../common/TableRowComp';
import {
  ContractData,
  ContractDataWithIndex,
  getContractRegistry
} from '../../contracts/contract-registry/ContractRegistry-support';
import { AddressBoxWithCopy } from '../common/AddressBoxWithCopy';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { ContracVerifierDialog } from './ContracVerifierDialog';
import { useAppContext } from '../AppContextProvider';

export function ContractVerifierUi() {
  const { wrap, web3Session } = useAppContext();
  const { web3, publicAddress } = web3Session || {};

  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [openVerifierDialog, setOpenVerifierDialog] = useState<ContractData>();
  const [data, setData] = useState<ContractDataWithIndex[]>([]);

  const refreshData = useCallback(async () => {
    const contractRegistry = getContractRegistry();
    if (publicAddress && web3 && contractRegistry) {
      await wrap('Loading Contract Registry Data...', async () => {
        const list: ContractDataWithIndex[] = [];
        const count = await contractRegistry.getContractDataCount();
        if (isStatusMessage(count)) {
          setStatusMessage(count);
          return;
        }
        for (let index = 0; index < count; index++) {
          const data = await contractRegistry.getContractData(index);
          if (isStatusMessage(data)) {
            setStatusMessage(data);
            return;
          }
          list.push(data);
        }
        setData(list);
      });
    }
  }, [wrap, publicAddress, web3]);

  useEffect(() => {
    refreshData().catch(console.error);
  }, [refreshData]);

  const contractRegistry = getContractRegistry();

  if (!web3 || !publicAddress || !contractRegistry) {
    return <StatusMessageElement statusMessage={infoMessage('Loading ...')} />;
  }

  const tableHeader = [`Nr`, 'Name', 'Contract', 'Address'];

  return (
    <Stack spacing={1}>
      <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />
      <Stack spacing={1} sx={{ border: 'solid 2px gray', borderRadius: '' }} p={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ borderBottom: 'solid 2px gray' }}
        >
          <LDBox sx={{ fontSize: '2em' }}>{'Contract Registry'}</LDBox>
          <Stack direction={'row'} alignItems="center">
            <Button key={'refresh'} onClick={() => wrap('Refresh Data...', () => refreshData())}>
              Refresh
            </Button>
          </Stack>
        </Stack>

        <Table>
          <TableHead>
            <TableRowComp elements={tableHeader} />
          </TableHead>
          <TableBody>
            {data.map((cd) => {
              const elements = [
                `Nr ${cd.index + 1}`,
                cd.name,
                <AddressBoxWithCopy key={'contract-address'} value={cd.contractAddress} useNames={false} />,
                <Button
                  key={'start-verification'}
                  onClick={() => {
                    setOpenVerifierDialog(cd);
                  }}
                >
                  Start Verification
                </Button>
              ];

              return <TableRowComp key={cd.contractAddress} elements={elements} />;
            })}
          </TableBody>
        </Table>
      </Stack>
      {!!openVerifierDialog && (
        <ContracVerifierDialog
          contractData={openVerifierDialog}
          done={() => {
            setOpenVerifierDialog(undefined);
          }}
        />
      )}
    </Stack>
  );
}
