import { Button, Table, TableBody, TableHead } from '@mui/material';
import { Fragment, ReactNode, useCallback, useEffect, useState } from 'react';
import { infoMessage, isStatusMessage, StatusMessage } from '../../types';
import { TableRowComp } from '../common/TableRowComp';
import {
  ContractData,
  ContractDataWithIndex,
  getContractRegistry
} from '../../contracts/contract-registry/ContractRegistry-support';
import { AddressBoxWithCopy } from '../common/AddressBoxWithCopy';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { ContracVerifierDialog } from './ContracVerifierDialog';
import { useAppContext } from '../AppContextProvider';
import { CollapsiblePanel } from '../common/CollapsiblePanel';

export const contractVerifierTitle = 'Contract Verification';

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

  const toolbar: ReactNode[] = [
    <Button key={'refresh'} onClick={() => wrap('Refresh Data...', () => refreshData())}>
      Refresh
    </Button>
  ];
  const content: ReactNode[] = [
    <StatusMessageElement
      key={'status-message'}
      statusMessage={statusMessage}
      onClose={() => setStatusMessage(undefined)}
    />,
    <Table key={'table'}>
      <TableHead>
        <TableRowComp elements={tableHeader} />
      </TableHead>
      <TableBody>
        {data.map((cd) => {
          const elements = [
            `Nr ${(cd.index ?? 0) + 1}`,
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
  ];

  return (
    <Fragment>
      <CollapsiblePanel collapsible={false} title={contractVerifierTitle} toolbar={toolbar} content={content} />

      {!!openVerifierDialog && (
        <ContracVerifierDialog
          contractData={openVerifierDialog}
          done={() => {
            setOpenVerifierDialog(undefined);
          }}
        />
      )}
    </Fragment>
  );
}
