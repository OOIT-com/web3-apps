import { useEffect, useState } from 'react';
import { Box, Button, Stack, TextField } from '@mui/material';
import { AddressBoxWithCopy } from '../common/AddressBoxWithCopy';
import { isValidAddress } from 'ethereumjs-util';
import { errorMessage, NotifyRefresh, NotifyStatusMessage } from '../../types';
import { getOwnableWithBackup } from '../../contracts/ownable-with-backup/OwnableWithBackup-support';
import { toUserMessage } from '../../contracts/contract-utils';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { useAppContext } from '../AppContextProvider';

export type BackupOwnerEditProps = {
  contractAddress: string;
  backupAddress: string;
  isOwner: boolean;
  isBackupOwner: boolean;
  notifyStatusMessage: NotifyStatusMessage;
  notifyRefresh: NotifyRefresh;
};

export function BackupOwnerEditUi({
  contractAddress,
  backupAddress,
  isOwner,
  isBackupOwner,
  notifyStatusMessage,
  notifyRefresh
}: Readonly<BackupOwnerEditProps>) {
  const { wrap, web3Session } = useAppContext();
  const { web3, publicAddress } = web3Session || {};
  const [backupAddress4Edit, setBackupAddress4Edit] = useState('');

  useEffect(() => {
    setBackupAddress4Edit(backupAddress);
  }, [backupAddress]);

  if (!publicAddress || !web3) {
    return <StatusMessageElement statusMessage={errorMessage('No public address!')} />;
  }
  const owb = getOwnableWithBackup(web3, contractAddress);

  return (
    <Stack direction={'row'}>
      {!isOwner && !backupAddress && <Box>Not set</Box>}
      {isOwner && !backupAddress && (
        <TextField
          value={backupAddress4Edit}
          onChange={(e) => setBackupAddress4Edit(e.target.value)}
          fullWidth={true}
          sx={{ width: `30em` }}
          size={'small'}
        />
      )}
      {backupAddress && <AddressBoxWithCopy key={'view'} value={backupAddress} reduced={false} useNames={true} />}
      {/*Actions*/}
      {isOwner && backupAddress && (
        <Button
          key={'remove'}
          size={'small'}
          disabled={!isValidAddress(backupAddress4Edit)}
          onClick={() => {
            wrap(`Remove Backup Owner: ${backupAddress}`, async () => {
              const res = await owb.removeBackupOwner(backupAddress, publicAddress);
              notifyRefresh(res.status !== 'error');
              notifyStatusMessage(toUserMessage(res));
            });
          }}
        >
          remove
        </Button>
      )}

      {isOwner && !backupAddress && (
        <Button
          key={'add'}
          size={'small'}
          disabled={!isValidAddress(backupAddress4Edit)}
          onClick={() => {
            wrap(`Add Backup Owner: ${backupAddress4Edit}`, async () => {
              const res = await owb.addBackupOwner(backupAddress4Edit, publicAddress);
              notifyRefresh(res.status !== 'error');
              notifyStatusMessage(toUserMessage(res));
            });
          }}
        >
          add
        </Button>
      )}
      {isBackupOwner && backupAddress && (
        <Button
          key={'vote-4-new-owner'}
          size={'small'}
          onClick={async () => {
            const res = await wrap('Vote for new owner', () => owb.voteForNewOwner(backupAddress, publicAddress));
            notifyStatusMessage(toUserMessage(res));
          }}
        >
          vote 4 new owner
        </Button>
      )}
    </Stack>
  );
}
