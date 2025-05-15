import { Box, Button, Stack, Table, TableBody, TableHead } from '@mui/material';
import { Fragment, ReactNode, useCallback, useEffect, useState } from 'react';
import { TableRowComp } from '../common/TableRowComp';
import {
  ContractData,
  ContractDataWithIndex,
  getContractRegistry,
  getContractRegistryContractAddress
} from '../../contracts/contract-registry/ContractRegistry-support';
import { AddressBoxWithCopy } from '../common/AddressBoxWithCopy';
import { ContractDataEditDialog } from './ContractDataEditDialog';
import { ContractDataRetrieveDialog } from './ContractDataRetrieveDialog';
import { getOwnableWithBackup, getOwner } from '../../contracts/ownable-with-backup/OwnableWithBackup-support';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { ContractEntryDetailView } from './ContractEntryDetailView';
import { OwnableWithBackupDialog } from '../ownable-with-backup/OwnableWithBackupDialog';
import { TransferOwnershipDialog } from './TransferOwnershipDialog';
import { useAppContext } from '../AppContextProvider';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import { NoContractFound } from '../common/NoContractFound';
import { ContractName } from '../../contracts/contract-utils';
import { displayAddress } from '../../utils/misc-util';
import {infoMessage, isStatusMessage, StatusMessage} from "../../utils/status-message";

export const OwnableWithBackup = 'OwnableWithBackup';
export const Owner = 'Owner';

export type CommandName = 'OwnableWithBackup' | 'DataView' | 'TransferContractRegistry' | 'Transfer';

export function ContractRegistryListUi() {
  const { wrap, web3Session } = useAppContext();
  const { web3, publicAddress } = web3Session || {};

  const [owner, setOwner] = useState('');
  const [data, setData] = useState<ContractDataWithIndex[]>([]);
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [contractData4Edit, setContractData4Edit] = useState<'new' | ContractData>();
  const [openDialog, setOpenDialog] = useState<CommandName>();
  const [selected, setSelected] = useState<ContractData>();
  const [ownableWithBackupIndex, setOwnableWithBackupIndex] = useState(-1);
  const [startRetrieval, setStartRetrieval] = useState(false);

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
      <Button key={'transfer-ownership'} onClick={() => setOpenDialog('TransferContractRegistry')}>
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
            `Nr ${(cd.index ?? 0) + 1}`,
            <Button
              key={'name'}
              variant={'text'}
              onClick={() => {
                setSelected(cd);
                setOpenDialog('DataView');
              }}
            >
              {cd.name}
            </Button>,
            <Box
              key={'contract-name'}
              onClick={() => {
                setSelected(cd);
                setOpenDialog('DataView');
              }}
            >
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
        key={'contract-data-edit'}
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

      {openDialog === 'TransferContractRegistry' && (
        <TransferOwnershipDialog
          key={'transfer-contract-registry'}
          done={() => setOpenDialog(undefined)}
          title={`Transfer Contract Registry ${displayAddress(contractRegistry.contractAddress)}`}
          transfer={(newOwner: string) => contractRegistry.transferOwnership(newOwner, publicAddress)}
        />
      )}
      {openDialog === 'Transfer' && selected && (
        <TransferOwnershipDialog
          key={'transfer'}
          done={() => setOpenDialog(undefined)}
          title={`Transfer ${selected.name} ${displayAddress(selected.contractAddress)}`}
          transfer={(newOwner: string) =>
            wrap('Transfer ownership...', async () => {
              if (selected) {
                const owb = getOwnableWithBackup(web3, selected.contractAddress);
                return owb.transferOwnership(newOwner, publicAddress);
              }
            })
          }
        />
      )}
      {openDialog === 'DataView' && selected && (
        <ContractEntryDetailView
          key={'detail-view'}
          contractData={selected}
          done={() => setOpenDialog(undefined)}
          action={(command, index) => {
            setOpenDialog(command);
            setOwnableWithBackupIndex(index);
          }}
        />
      )}
      {openDialog === 'OwnableWithBackup' && ownableWithBackupIndex > -1 && (
        <OwnableWithBackupDialog
          key={'OwnableWithBackup'}
          contractAddress={data[ownableWithBackupIndex].contractAddress}
          done={() => setOpenDialog(undefined)}
        />
      )}
      {openDialog === 'OwnableWithBackup' && ownableWithBackupIndex > -1 && (
        <OwnableWithBackupDialog
          key={'OwnableWithBackup-2'}
          contractAddress={data[ownableWithBackupIndex].contractAddress}
          done={() => setOpenDialog(undefined)}
        />
      )}
    </Fragment>
  );
}
