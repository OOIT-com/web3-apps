import { Box, Button, Stack, Table, TableBody, TableHead } from '@mui/material';
import { Fragment, ReactNode, useCallback, useEffect, useState } from 'react';
import { infoMessage, isStatusMessage, StatusMessage } from '../../types';
import TableRowComp from '../common/TableRowComp';
import {
  ContractData,
  ContractDataWithIndex,
  getContractRegistry,
  getContractRegistryContractAddress
} from '../../contracts/contract-registry/ContractRegistry-support';
import { AddressBoxWithCopy } from '../common/AddressBoxWithCopy';
import { ContractDataEditDialog } from './ContractDataEditDialog';
import { ContractDataRetrieveDialog } from './ContractDataRetrieveDialog';
import { getOwner } from '../../contracts/ownable-with-backup/OwnableWithBackup-support';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { ContractEntryView } from './ContractEntryView';
import { OwnableWithBackupDialog } from '../ownable-with-backup/OwnableWithBackupDialog';
import { TransferOwnershipDialog } from './TransferOwnershipDialog';
import { useAppContext } from '../AppContextProvider';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import { NoContractFound } from '../common/NoContractFound';
import { ContractName } from '../../contracts/contract-utils';

export const OwnableWithBackup = 'OwnableWithBackup';

export function ContractRegistryListUi() {
  const { wrap, web3Session } = useAppContext();
  const { web3, publicAddress } = web3Session || {};

  const [owner, setOwner] = useState('');
  const [data, setData] = useState<ContractDataWithIndex[]>([]);
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [contractData4Edit, setContractData4Edit] = useState<'new' | ContractData>();
  const [contractData4View, setContractData4View] = useState<false | ContractData>();
  const [ownableWithBackupIndex, setOwnableWithBackupIndex] = useState(-1);
  const [startRetrieval, setStartRetrieval] = useState(false);
  const [startOwnershipTransfer, setStartOwnershipTransfer] = useState(false);

  const contractRegistry = getContractRegistry();

  const refreshData = useCallback(async () => {
    if (publicAddress && web3 && contractRegistry) {
      await wrap('Loading Contract Registry Data...', async () => {
        const owner0 = await getOwner(web3, getContractRegistryContractAddress());
        if (isStatusMessage(owner0)) {
          setStatusMessage(owner0);
          return;
        }
        setOwner(owner0);
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
  }, [publicAddress, web3, contractRegistry, wrap]);

  useEffect(() => {
    refreshData().catch(console.error);
  }, [refreshData]);

  if (!contractRegistry) {
    return <NoContractFound name={ContractName.CONTRACT_REGISTRY} />;
  }
  if (!web3 || !publicAddress || !contractRegistry) {
    return <StatusMessageElement statusMessage={infoMessage('Loading ...')} />;
  }

  const isOwner = publicAddress === owner;
  const tableHeader = [`Nr`, 'Name', 'Contract', 'Address'];
  if (isOwner) {
    tableHeader.push('Actions');
  }

  const title = 'List of Registered Contracts';
  const toolbar: ReactNode[] = [
    isOwner ? (
      <Button key={'transfer-ownership'} onClick={() => setStartOwnershipTransfer(true)}>
        Ownership Transfer
      </Button>
    ) : (
      <Box sx={{ fontSize: '80%' }}>(Not Owner)</Box>
    ),
    <Button key={'retrieve'} onClick={() => setStartRetrieval(true)}>
      Retrieval
    </Button>,
    isOwner ? (
      <Button key={'register'} onClick={() => setContractData4Edit('new')}>
        Register
      </Button>
    ) : (
      <></>
    ),
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
            `Nr ${cd.index + 1}`,
            <Button key={'name'} variant={'text'} onClick={() => setContractData4View(cd)}>
              {cd.name}
            </Button>,
            <Box key={'contract-name'} onClick={() => setContractData4View(cd)}>
              {cd.contractName}
            </Box>,
            <AddressBoxWithCopy key={'contract-address'} value={cd.contractAddress} useNames={false} />
          ];
          if (isOwner) {
            elements.push(
              <Stack key={'actions'} direction={'row'} spacing={1}>
                <Button key={'edit'} onClick={() => setContractData4Edit(cd)}>
                  edit
                </Button>
                <Button
                  key={'unregister'}
                  onClick={async () => {
                    wrap(`Unregister ${cd.name}`, async () => {
                      await contractRegistry.unregister(cd.contractAddress, publicAddress);
                      await refreshData();
                    });
                  }}
                >
                  unregister
                </Button>
              </Stack>
            );
          }
          return <TableRowComp key={cd.contractAddress} elements={elements} />;
        })}
      </TableBody>
    </Table>
  ];
  if (contractData4Edit) {
    content.push(
      <ContractDataEditDialog
        contractDataIn={contractData4Edit}
        done={(refreshNeeded: boolean) => {
          setContractData4Edit(undefined);
          if (refreshNeeded) {
            refreshData();
          }
        }}
      />
    );
  }

  if (startRetrieval) {
    content.push(
      <ContractDataRetrieveDialog
        key={'contract-retrieval'}
        done={() => setStartRetrieval(false)}
        openForEdit={
          isOwner
            ? (contractData: ContractData) => {
                setStartRetrieval(false);
                setContractData4Edit(contractData);
              }
            : undefined
        }
      />
    );
  }

  return (
    <Fragment>
      <CollapsiblePanel level={'second'} title={title} collapsible={false} toolbar={toolbar} content={content} />

      {startOwnershipTransfer && (
        <TransferOwnershipDialog
          done={() => setStartOwnershipTransfer(false)}
          title={'Transfer Contract Registry'}
          transfer={(newOwner: string) => contractRegistry.transferOwnership(newOwner, publicAddress)}
        />
      )}
      {contractData4View && (
        <ContractEntryView
          contractData={contractData4View}
          done={() => setContractData4View(false)}
          action={(_, index) => {
            setContractData4View(false);
            setOwnableWithBackupIndex(index);
          }}
        />
      )}
      {ownableWithBackupIndex > -1 && (
        <OwnableWithBackupDialog
          contractAddress={data[ownableWithBackupIndex].contractAddress}
          done={() => setOwnableWithBackupIndex(-1)}
        />
      )}
    </Fragment>
  );
}
