import { Button, Stack, Table, TableBody } from '@mui/material';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { errorMessage, infoMessage, isStatusMessage, StatusMessage } from '../../types';
import { LDBox } from '../common/StyledBoxes';
import { getOwnableWithBackup } from '../../contracts/ownable-with-backup/OwnableWithBackup-support';
import { AddressBoxWithCopy } from '../common/AddressBoxWithCopy';
import { TableRowComp } from '../common/TableRowComp';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { toUserMessage } from '../../contracts/contract-utils';
import { BackupOwnerEditUi } from './BackupOwnerEditUi';
import { useAppContext } from '../AppContextProvider';

type OwnableWithBackupData = {
  maxLength: number;
  minNumberOfVotes: number;
  length: number;
  backupOwners: string[];
  owner: string;
  contractAddress: string;
};

export function OwnableWithBackupUi({ contractAddress }: Readonly<{ contractAddress: string }>) {
  const { wrap, web3Session } = useAppContext();
  const { web3, publicAddress } = web3Session || {};

  const [data, setData] = useState<OwnableWithBackupData>();
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();

  const refreshData = useCallback(async () => {
    if (publicAddress && web3) {
      const owb = getOwnableWithBackup(web3, contractAddress);
      try {
        const owner0 = await owb.owner();
        if (isStatusMessage(owner0)) {
          setStatusMessage(toUserMessage(owner0));
          return;
        }
        const maxLength = await owb.maxMaxNumberOfBackupOwners();
        const length = await owb.getBackupOwnerCount();
        if (isStatusMessage(length)) {
          setStatusMessage(toUserMessage(length));
          return;
        }
        const backupOwners: string[] = [];
        for (let index = 0; index < length; index++) {
          const bo = await owb.getBackupOwner(index);
          if (isStatusMessage(bo)) {
            setStatusMessage(toUserMessage(bo));
            return;
          }
          backupOwners.push(bo);
        }
        const minNumberOfVotes0 = await owb.minNumberOfVotes();
        if (isStatusMessage(minNumberOfVotes0)) {
          setStatusMessage(toUserMessage(minNumberOfVotes0));
          return;
        }
        setData({
          length,
          backupOwners,
          maxLength,
          owner: owner0,
          minNumberOfVotes: minNumberOfVotes0,
          contractAddress
        });
      } catch (e) {
        setStatusMessage(errorMessage('Could not refresh data', e));
      }
    }
  }, [publicAddress, contractAddress, web3]);

  useEffect(() => {
    wrap('Load Data...', () => refreshData()).catch(console.error);
  }, [wrap, refreshData]);

  if (!data || !publicAddress || !web3) {
    return <StatusMessageElement statusMessage={infoMessage('Loading ...')} />;
  }
  const isOwner = data.owner === publicAddress;
  const isBackupOwner = !!data.backupOwners.find((o) => o === publicAddress);

  const fullBackupOwners: string[] = new Array(data.maxLength)
    .fill('')
    .map((_, index) => data.backupOwners[index] || '');

  return (
    <Stack spacing={1}>
      <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />
      <Stack
        spacing={1}
        sx={{
          border: 'solid 2px gray',
          borderRadius: ''
        }}
        p={2}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{
            // borderBottom: 'solid 2px gray', paddingBottom: '1em',
            background: 'lightGray',
            padding: '0.4em'
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <LDBox sx={{ fontSize: '1.6em' }}>Owner Management</LDBox>
            <LDBox sx={{ fontSize: '1.2em' }}>
              <AddressBoxWithCopy
                key={'contractAddress'}
                value={data.contractAddress}
                useNames={true}
                reduced={false}
              />
            </LDBox>
          </Stack>
          <Button onClick={() => wrap('Refresh Data...', () => refreshData())}>Refresh</Button>
        </Stack>

        <Table>
          <TableBody>
            <TableRowComp
              key={'owner'}
              elements={[
                `Owner Address`,
                <AddressBoxWithCopy key={'owner'} value={data.owner} useNames={true} reduced={false} />,
                ''
              ]}
            />
            <TableRowComp key={'am-i-the-owner'} elements={[`Am I the owner?`, isOwner.toString(), '']} />
            <TableRowComp key={'maxNr'} elements={[`Maximum Number of Backup Owners`, data?.maxLength || '-', '']} />
            <TableRowComp
              key={'nr-of-backup-owners'}
              elements={[`Backup Owners set`, data.backupOwners.length || '0', '']}
            />
            <TableRowComp key={'min-number-of-votes'} elements={[`Votes needed`, data?.minNumberOfVotes || '-', '']} />

            <Fragment key={'backup-owners'}>
              {fullBackupOwners.map((addr, index) => (
                <TableRowComp
                  key={addr + getKey(index)}
                  elements={[
                    `Backup Owner Nr ${index + 1}`,
                    <BackupOwnerEditUi
                      key={contractAddress}
                      contractAddress={contractAddress}
                      backupAddress={addr}
                      isOwner={isOwner}
                      isBackupOwner={isBackupOwner}
                      notifyStatusMessage={(res) => setStatusMessage(res)}
                      notifyRefresh={async (refresh) => {
                        refresh && (await refreshData());
                      }}
                    />
                    // iAmOwner ? (
                    //   <ActionForBackupOwner
                    //     // isOwner={iAmOwner}
                    //     key={'action-for-backup-owner'}
                    //     backupAddress={addr}
                    //     save={async (addr0: string) => {
                    //       const res = await (addr
                    //         ? wrap(`Remove Backup Owner: ${addr0}`, async () => {
                    //             const res = await removeBackupOwner(contractAddress, addr0, publicAddress);
                    //             await refreshData();
                    //             return res;
                    //           })
                    //         : wrap(`Add Backup Owner: ${addr0}`, async () => {
                    //             const res = await addBackupOwner(contractAddress, addr0, publicAddress);
                    //             await refreshData();
                    //             return res;
                    //           }));
                    //       setStatusMessage(toUserMessage(res));
                    //     }}
                    //   />
                    // ) : addr ? (
                    //   <AddressBoxWithCopy key={'view'} value={addr} reduced={false} useNames={true} />
                    // ) : (
                    //   <Box key={'unset'}>Unset</Box>
                    // ),
                    // addr ? (
                    //   <Button
                    //     key={'vote-4-new-owner'}
                    //     disabled={!iAmBackupOwner}
                    //     size={'small'}
                    //     onClick={() =>
                    //       wrap('Vote for new owner', () => voteForNewOwner(contractAddress, addr, publicAddress)).then(
                    //         (statusMessage) => setStatusMessage(toUserMessage(statusMessage))
                    //       )
                    //     }
                    //   >
                    //     Vote 4 New Owner
                    //   </Button>
                    // ) : (
                    //   ''
                    // )
                  ]}
                />
              ))}
            </Fragment>
            <TableRowComp
              key={'activate-new-owner'}
              elements={[
                `Try to activate new Owner`,
                <Button
                  key={'activate-me'}
                  disabled={!isBackupOwner}
                  size={'small'}
                  onClick={async () => {
                    const owb = getOwnableWithBackup(web3, contractAddress);

                    const res = await wrap('Vote for new owner', async () => {
                      const res = await owb.activateOwnership(publicAddress);
                      await refreshData();
                      return res;
                    });
                    setStatusMessage(res);
                  }}
                >
                  Activate Me as New Owner
                </Button>,
                ''
              ]}
            />
          </TableBody>
        </Table>
      </Stack>
    </Stack>
  );
}

function getKey(index: number) {
  return 'K' + index;
}
