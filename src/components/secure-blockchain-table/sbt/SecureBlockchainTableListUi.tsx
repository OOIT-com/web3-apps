import { Button, Stack, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import * as React from 'react';
import { FC, Fragment, useCallback, useEffect, useState } from 'react';
import { infoMessage, isStatusMessage, StatusMessage } from '../../../types';
import { StatusMessageElement } from '../../common/StatusMessageElement';
import { ContractDataWithIndex } from '../../../contracts/contract-registry/ContractRegistry-support';
import {
  getSecureBlockchainTableList,
  SBTManager
} from '../../../contracts/secure-blockchain-table/SecureBlockchainTable-support';
import { SecureBlockchainTablePanel } from './SecureBlockchainTablePanel';
import { CollapsiblePanel } from '../../common/CollapsiblePanel';
import { OwnableWithBackupDialog } from '../../ownable-with-backup/OwnableWithBackupDialog';
import { SalaryManagerTabConfig, SBTOpenMode } from '../SecureBlockchainTableUi';
import { useAppContext } from '../../AppContextProvider';

export const SecureBlockchainTableListUi: FC<{
  setConfig: (config: SalaryManagerTabConfig) => void;
  prefix: string;
  isOwner: boolean;
}> = ({ setConfig, prefix, isOwner }) => {
  const { wrap, web3Session } = useAppContext();

  const [salaryManagerDataList, setSalaryManagerDataList] = useState<ContractDataWithIndex[]>([]);
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [openOwnership, setOpenOwnership] = useState('');

  const refresh = useCallback(
    async () =>
      wrap('Reading SBT List...', async () => {
        const list = await getSecureBlockchainTableList();
        if (isStatusMessage(list)) {
          setStatusMessage(list);
        } else {
          setSalaryManagerDataList(list);
        }
      }),
    [wrap]
  );
  useEffect(() => {
    refresh().catch(console.error);
  }, [refresh]);

  const openDetail = useCallback(
    async (data: ContractDataWithIndex, mode: SBTOpenMode) => {
      if (!web3Session) {
        return;
      }
      const sbtManager = new SBTManager(data, web3Session);
      await wrap('Init SBT Manager...', () => sbtManager.init());
      setConfig({ sbtManager: sbtManager, mode });
    },
    [web3Session, wrap, setConfig]
  );

  if (!web3Session) {
    return <StatusMessageElement statusMessage={infoMessage('Web3 not initialized')} />;
  }

  if (statusMessage) {
    return <StatusMessageElement statusMessage={statusMessage} />;
  }

  const content =
    salaryManagerDataList.length === 0 ? (
      <StatusMessageElement statusMessage={infoMessage(`No Salary Manager contracts found!`)} />
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
          {salaryManagerDataList
            .filter((e) => e.name.startsWith(prefix))
            .map((data, index) => {
              const { name } = data;

              return (
                <Fragment key={'frag-' + index}>
                  <TableRow key={'row-detail' + index}>
                    <TableCell key={'index'}>{1 + index}</TableCell>
                    <TableCell key={'name'}>{name}</TableCell>

                    <TableCell key={'actions'}>
                      <Stack direction={'row'}>
                        <Button key={'edit'} onClick={() => openDetail(data, 'edit')}>
                          Edit
                        </Button>
                        <Button key={'app'} onClick={() => openDetail(data, 'app')}>
                          App
                        </Button>
                        <Button
                          key={'ownership'}
                          onClick={() => {
                            setOpenOwnership(data.contractAddress);
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
