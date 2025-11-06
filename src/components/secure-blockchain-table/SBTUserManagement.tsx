import { NotifyInfoFun } from '../../types';
import * as React from 'react';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import { Stack, Table, TableBody } from '@mui/material';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import { SBTManager } from '../../contracts/secure-blockchain-table/SecureBlockchainTable-support';
import { TableRowComp } from '../common/TableRowComp';
import { isAddress } from 'ethers';
import { displayAddress } from '../../utils/misc-util';
import { decryptBase64 } from '../../utils/enc-dec-utils';
import { getPublicKeyStore } from '../../contracts/public-key-store/PublicKeyStore-support';
import { AddressEntryField } from '../address-book/AddressEntryField';
import { AddressBoxWithCopy } from '../common/AddressBoxWithCopy';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { LDBox } from '../common/StyledBoxes';
import { useAppContext } from '../AppContextProvider';
import { ButtonPanel } from '../common/ButtonPanel';
import { errorMessage, isStatusMessage, StatusMessage } from '../../utils/status-message';
import { encryptForUser } from '../shared-secret-store/shared-secret-store-utils';

export function SBTUserManagement({
  sbtManager,
  editable
}: Readonly<{
  sbtManager: SBTManager;
  editable: boolean;
}>) {
  const { wrap } = useAppContext();
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [users, setUsers] = useState<string[]>([]);
  const [owner, setOwner] = useState<string>();
  const [newUser, setNewUser] = useState('');
  const [removeDialog, setRemoveDialog] = useState('');

  const refreshData = useCallback(() => {
    wrap(`Reading User List...`, async () => {
      const users = await sbtManager.getUsers();
      if (isStatusMessage(users)) {
        setStatusMessage(users);
      } else {
        setUsers(users);
      }
    }).catch(console.error);
    wrap(`Reading Owner...`, async () => {
      const owner = await sbtManager.owb.owner();
      if (isStatusMessage(owner)) {
        setStatusMessage(owner);
      } else {
        setOwner(owner);
      }
    }).catch(console.error);
  }, [wrap, sbtManager]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const toolbar: ReactNode[] = [];

  toolbar.push(
    <Button key={'refresh'} onClick={refreshData}>
      Refresh
    </Button>
  );

  const content = (
    <Stack spacing={1}>
      <ButtonPanel
        mode={'space-between'}
        content={[
          <AddressEntryField
            key={'address-entry-field'}
            disabled={!editable}
            label={'New User'}
            address={newUser}
            setAddress={setNewUser}
          />,
          <Button
            key={'add-user'}
            disabled={!newUser || !isAddress(newUser)}
            sx={{ whiteSpace: 'nowrap' }}
            onClick={async () => {
              const res = wrap(`Add user ${displayAddress(newUser)}...`, async () => {
                setStatusMessage(undefined);
                const publicKeyStore = getPublicKeyStore();
                if (!publicKeyStore) {
                  setStatusMessage(errorMessage('No public key store is available!'));
                  return;
                }

                const myEncSecret = await sbtManager.getMyEncSecret();
                if (isStatusMessage(myEncSecret)) {
                  setStatusMessage(myEncSecret);
                  return;
                }
                const secret64 = await decryptBase64(myEncSecret, sbtManager.web3Session.decryptFun);
                if (isStatusMessage(secret64)) {
                  setStatusMessage(secret64);
                  return;
                }
                const encryptedSecret4User = await encryptForUser(
                  wrap,
                  newUser,
                  Buffer.from(secret64, 'base64'),
                  publicKeyStore
                );
                if (isStatusMessage(encryptedSecret4User)) {
                  setStatusMessage(encryptedSecret4User);
                  return;
                }
                const encBase64 = Buffer.from(encryptedSecret4User).toString('base64');
                const res = await sbtManager.setEncSecret(newUser, encBase64);
                if (isStatusMessage(res)) {
                  setStatusMessage(res);
                } else {
                  refreshData();
                }
              });
              if (isStatusMessage(res)) {
                setStatusMessage(res);
              }
            }}
          >
            Add User
          </Button>
        ]}
        // key={'edit-row-entry'}
        // direction={'row'}
        // justifyContent="space-between"
        // alignItems="baseline"
        // spacing={1}
        // sx={{ margin: '1em 0' }}
      />
      <Table>
        <TableBody>
          {users.map((user) => (
            <TableRowComp
              key={user}
              elements={[
                <AddressBoxWithCopy key={user} value={user} useNames={true} reduced={false} variant={'standard'} />,
                owner !== user ? <Button onClick={() => setRemoveDialog(user)}>remove</Button> : '[Contract Owner]'
              ]}
            />
          ))}
        </TableBody>
      </Table>

      <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />
      <RemoveDialog
        address={removeDialog}
        done={async (address) => {
          if (address) {
            const res = await wrap(`Remove ${displayAddress(address)}...`, async () =>
              sbtManager.removeEncSecret(address)
            );
            if (isStatusMessage(res)) {
              setStatusMessage(res);
            } else {
              refreshData();
            }
          }
          setRemoveDialog('');
        }}
      />
    </Stack>
  );

  return (
    <CollapsiblePanel collapsed={true} title={`Users / Accounts with Access`} toolbar={toolbar} content={content} />
  );
}

function RemoveDialog({ address, done }: Readonly<{ address: string; done: NotifyInfoFun }>) {
  return (
    <Dialog open={!!address} onClose={() => done()}>
      <DialogTitle>Remove User / Account</DialogTitle>
      <DialogContent>
        <Stack>
          <LDBox>Do you really want to remove the following User / Account?</LDBox>
        </Stack>
        <Stack direction={'row'} alignItems={'flex-end'} justifyContent={'space-between'}>
          <Button onClick={() => done(address)}>Remove</Button>
          <Button onClick={() => done()}>Cancel</Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
