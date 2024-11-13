import * as React from 'react';
import { FC, useCallback, useEffect, useState } from 'react';
import { infoMessage, isStatusMessage, StatusMessage, warningMessage } from '../../types';

import { StatusMessageElement } from '../common/StatusMessageElement';
import { ContractName } from '../../contracts/contract-utils';
import { useAppContext } from '../AppContextProvider';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import { NameAddressEntry, UniversalNameStore } from '../../contracts/universal-name-store/UniversalNameStore-support';
import { Web3NotInitialized } from '../common/Web3NotInitialized';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { TableRowComp } from '../common/TableRowComp';
import Button from '@mui/material/Button';
import { NameRetrievalDialog } from './NameRetrievalDialog';

export const NameListUi: FC<{ universalNameStore: UniversalNameStore }> = ({ universalNameStore }) => {
  const app = useAppContext();
  const { wrap } = app;
  const { web3, publicAddress } = app.web3Session || {};
  const [startRetrieval, setStartRetrieval] = useState(false);
  const [count, setCount] = useState('0');
  const [entries, setEntries] = useState<NameAddressEntry[]>([]);

  const [statusMessage, setStatusMessage] = useState<StatusMessage>();

  const refreshData = useCallback(
    () =>
      wrap('Refresh data...', async () => {
        if (universalNameStore && web3 && publicAddress) {
          // Count

          const count = await universalNameStore.getAddressCount();
          if (isStatusMessage(count)) {
            setStatusMessage(count);
          } else {
            setCount(count.toString());
          }

          //
          const entries = await universalNameStore.getAllAddresses();
          if (isStatusMessage(entries)) {
            setStatusMessage(entries);
          } else {
            setEntries(entries);
          }
        }
      }),
    [wrap, web3, universalNameStore, publicAddress]
  );

  useEffect(() => {
    refreshData().catch(console.error);
  }, [refreshData]);

  if (!web3 || !publicAddress) {
    return <Web3NotInitialized />;
  }
  if (!universalNameStore) {
    return (
      <StatusMessageElement
        statusMessage={warningMessage(`No contract found for ${ContractName.UNIVERSAL_NAME_STORE}`)}
      />
    );
  }

  return (
    <CollapsiblePanel
      collapsible={true}
      collapsed={true}
      level={'second'}
      key={'na'}
      title={'List of all Universal Names'}
      toolbar={[
        <Button key={'retrieval'} onClick={() => setStartRetrieval(true)}>
          Retrieval
        </Button>,
        <Button key={'refresh'} onClick={() => refreshData()}>
          Refresh
        </Button>
      ]}
      content={[
        <StatusMessageElement key={'sm1'} statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />,
        <StatusMessageElement key={'balance'} statusMessage={infoMessage(`Name count: ${count}`)} />,
        <Table key={'table'} sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell key={'name'}>Name</TableCell>
              <TableCell key={'address'}>Address</TableCell>
              <TableCell key={'owner'}>Owner</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map(({ name, address, owner }) => (
              <TableRowComp key={name} elements={[name, address, owner]} />
            ))}
          </TableBody>
        </Table>,

        startRetrieval && (
          <NameRetrievalDialog
            key={'name-retrieval-dialog'}
            universalNameStore={universalNameStore}
            done={() => setStartRetrieval(false)}
          />
        )
      ]}
    />
  );
};
