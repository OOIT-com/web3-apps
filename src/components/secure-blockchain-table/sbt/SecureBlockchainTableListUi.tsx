import { Button, Stack, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import * as React from 'react';
import { FC, Fragment, useCallback, useEffect, useState } from 'react';
import { StatusMessageElement } from '../../common/StatusMessageElement';
import { ContractDataWithIndex } from '../../../contracts/contract-registry/ContractRegistry-support';
import {
  getSecureBlockchainTableList,
  SBTManager
} from '../../../contracts/secure-blockchain-table/SecureBlockchainTable-support';
import { SecureBlockchainTablePanel } from './SecureBlockchainTablePanel';
import { CollapsiblePanel } from '../../common/CollapsiblePanel';
import { OwnableWithBackupDialog } from '../../ownable-with-backup/OwnableWithBackupDialog';
import { SBTManagerData, SBTOpenMode } from '../SecureBlockchainTableUi';
import { useAppContext } from '../../AppContextProvider';
import { infoMessage, isStatusMessage, StatusMessage } from '../../../utils/status-message';

export const SecureBlockchainTableListUi: FC<{
  setCurrentSBT: (config: SBTManagerData) => void;
  prefix: string;
  isOwner: boolean;
}> = ({ setCurrentSBT, prefix, isOwner }) => {
  const { wrap, web3Session } = useAppContext();

  const [sbtContractList, setSbtContractList] = useState<ContractDataWithIndex[]>();
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [openOwnership, setOpenOwnership] = useState('');

  const refresh = useCallback(
    async () =>
      wrap('Reading SBT List...', async () => {
        const list = await getSecureBlockchainTableList();
        if (isStatusMessage(list)) {
          setStatusMessage(list);
        } else {
          setSbtContractList(list);
        }
      }),
    [wrap]
  );
  useEffect(() => {
    refresh().catch(console.error);
  }, [refresh]);

  const openSBTContract = useCallback(
    async (sbtContract: ContractDataWithIndex, mode: SBTOpenMode) => {
      if (!web3Session) {
        return;
      }
      const sbtManager = new SBTManager(sbtContract, web3Session);
      await wrap('Init SBT Manager...', () => sbtManager.init());
      setCurrentSBT({ sbtManager: sbtManager, mode });
    },
    [web3Session, wrap, setCurrentSBT]
  );

  if (!web3Session) {
    return <StatusMessageElement statusMessage={infoMessage('Web3 not initialized')} />;
  }

  if (statusMessage) {
    return <StatusMessageElement statusMessage={statusMessage} />;
  }

  const content = sbtContractList ? (
    sbtContractList.length === 0 ? (
      <StatusMessageElement statusMessage={infoMessage(`No Secure Blockchain Table contracts found!`)} />
    ) : (
      <Table sx={{ minWidth: 800 }}>
        <TableHead>
          <TableRow>
            <TableCell key={'index'}>Nr</TableCell>
            <TableCell key={'name'}>Name</TableCell>
            <TableCell key={'action'}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sbtContractList
            .filter((contract) => contract.name.startsWith(prefix))
            .map((sbtContract, index) => {
              const { name } = sbtContract;

              return (
                <Fragment key={'frag-' + index}>
                  <TableRow key={'row-detail' + index}>
                    <TableCell key={'index'}>{1 + index}</TableCell>
                    <TableCell key={'name'}>{name}</TableCell>

                    <TableCell key={'actions'}>
                      <Stack direction={'row'}>
                        <Button key={'edit'} onClick={() => openSBTContract(sbtContract, 'edit')}>
                          Edit
                        </Button>
                        <Button key={'app'} onClick={() => openSBTContract(sbtContract, 'app')}>
                          App
                        </Button>
                        <Button
                          key={'ownership'}
                          onClick={() => {
                            setOpenOwnership(sbtContract.contractAddress);
                          }}
                        >
                          Ownership
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                </Fragment>
              );
            })}
        </TableBody>
      </Table>
    )
  ) : (
    <StatusMessageElement statusMessage={infoMessage(`Loading...!`)} />
  );

  return (
    <Stack spacing={2}>
      <CollapsiblePanel
        level={'third'}
        title={'List of Tables'}
        toolbar={[
          <Button key={'refresh'} onClick={() => refresh()}>
            Refresh
          </Button>
        ]}
        content={content}
      />
      {!!openOwnership && <OwnableWithBackupDialog contractAddress={openOwnership} done={() => setOpenOwnership('')} />}
      {isOwner && <SecureBlockchainTablePanel refresh={refresh} prefix={prefix} />}
    </Stack>
  );
};
