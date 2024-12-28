import {
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  useTheme
} from '@mui/material';
import * as React from 'react';
import { ChangeEvent, FC, useCallback, useEffect, useState } from 'react';
import { errorMessage, isStatusMessage, NotifyFun, StatusMessage } from '../../types';
import { grey } from '@mui/material/colors';
import { display64, displayAddress } from '../../utils/misc-util';
import {
  deployShareSecretStoreContract,
  SharedSecretStore
} from '../../contracts/shared-secret-store/SharedSecretStore-support';
import { LDBox } from '../common/StyledBoxes';
import { getPublicKeyStore, PublicKeyStore } from '../../contracts/public-key-store/PublicKeyStore-support';
import { AddressBoxWithCopy } from '../common/AddressBoxWithCopy';
import { Base64Display } from '../common/Base64Display';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { useAppContext, WrapFun } from '../AppContextProvider';
import { encryptEthCryptoBinary } from '../../utils/eth-crypto-utils';
import { Web3NotInitialized } from '../common/Web3NotInitialized';

type User = {
  user: string;
  encryptedSecret: string;
  index: number;
};

async function getUsers(store: SharedSecretStore, publicAddress: string): Promise<StatusMessage | User[]> {
  const users: User[] = [];
  const userCount = await store.getUserCount(publicAddress);
  if (isStatusMessage(userCount)) {
    return userCount;
  }
  for (let index = 0; index < userCount; index++) {
    const user = await store.getUser(index, publicAddress);
    if (isStatusMessage(user)) {
      return user;
    }
    const encryptedSecret = await store.getUserEncryptedSecret(user, publicAddress);
    if (isStatusMessage(encryptedSecret)) {
      return encryptedSecret;
    }
    users.push({ user, encryptedSecret, index });
  }
  return users;
}

export const SharedSecretStoreUi: FC = () => {
  const theme = useTheme();
  const { wrap, web3Session } = useAppContext();
  const { web3, publicAddress, publicKey = '' } = web3Session || {};
  const [users, setUsers] = useState<User[]>([]);
  const [owner, setOwner] = useState('');
  const [encryptedSecret, setEncryptedSecret] = useState('');
  const [secret, setSecret] = useState('');
  const [newUser, setNewUser] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [sharedSecretStore, setSharedSecretStore] = useState<SharedSecretStore>();

  const updateUsers = useCallback(async () => {
    if (sharedSecretStore && publicAddress) {
      const users = await getUsers(sharedSecretStore, publicAddress);
      if (isStatusMessage(users)) {
        setStatusMessage(users);
      } else {
        setUsers(users);
      }
    }
  }, [sharedSecretStore, publicAddress]);

  const updateDetails = useCallback(async () => {
    if (sharedSecretStore && publicAddress) {
      const owner0 = await sharedSecretStore.owner(publicAddress);
      if (isStatusMessage(owner0)) {
        return owner;
      }
      setOwner(owner0);
      if (owner0 === publicAddress) {
        const encryptedSecret0 = await sharedSecretStore.getUserEncryptedSecret(publicAddress, publicAddress);
        if (isStatusMessage(encryptedSecret0)) {
          return encryptedSecret0;
        }
        setEncryptedSecret(encryptedSecret0);
      }
    }
  }, [sharedSecretStore, publicAddress, owner]);

  useEffect(() => {
    (async () => {
      await wrap('Update Contract Details', () => updateDetails());
      await wrap('Update Users', () => updateUsers());
    })();
  }, [wrap, updateUsers, updateDetails]);

  const publicKeyStore = getPublicKeyStore();

  if (!publicAddress || !web3 || !publicKeyStore) {
    return <Stack>Loading...</Stack>;
  }
  if (!web3Session) {
    return <Web3NotInitialized />;
  }

  return (
    <Stack spacing={2}>
      <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />

      <Stack
        direction={'row'}
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        mb={'1em'}
        sx={{ backgroundColor: theme.palette.mode === 'dark' ? grey['900'] : grey.A100 }}
      >
        <TextField
          size={'small'}
          fullWidth={true}
          label={'Contract Address for Shared Secret Store'}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setContractAddress(e.target.value)}
          value={contractAddress}
        />
        <Button
          key={'load-contract'}
          disabled={!contractAddress}
          onClick={() => {
            setSharedSecretStore(new SharedSecretStore(web3, contractAddress));
          }}
        >
          Load Contract
        </Button>
        <Button
          key={'Deploy New Contract'}
          disabled={!!contractAddress}
          onClick={async () => {
            const deplResult = await wrap('Deploy SharedSecretStore Contract', () =>
              deployShareSecretStoreContract(web3, publicKey, publicAddress)
            );
            if (isStatusMessage(deplResult)) {
              setStatusMessage(deplResult);
            } else {
              setContractAddress(deplResult.contractAddress);
              setEncryptedSecret(deplResult.encryptedSecret);
              setSharedSecretStore(new SharedSecretStore(web3, deplResult.contractAddress));
            }
          }}
        >
          Create and Deploy New Shared Secret Store
        </Button>
        <Button
          disabled={!contractAddress}
          onClick={() => {
            setStatusMessage(undefined);
            setSharedSecretStore(undefined);
            setContractAddress('');
            setUsers([]);
            setOwner('');
            setEncryptedSecret('');
            setNewUser('');
          }}
        >
          Clear
        </Button>
      </Stack>

      <Stack spacing={3} sx={{ border: 'solid 2px gray', borderRadius: '' }} p={2}>
        <LDBox sx={{ fontSize: '1.3em', margin: '1em 0 0.4em 0' }}>Shared Secret Store Contract</LDBox>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={2}>
          {!!sharedSecretStore && <AddressBoxWithCopy value={contractAddress} label={'Contract Address'} />}
          {!!owner && <AddressBoxWithCopy value={owner} label={'Owner'} />}
          {!!encryptedSecret && <Base64Display value={encryptedSecret} label={'My Encrypted Secret'} max={16} />}
          {!!encryptedSecret && <Button onClick={() => alert('missing decrypt function...')}>Show Secret</Button>}
        </Stack>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="baseline"
          spacing={2}
          sx={{ borderTop: 'solid 2px gray' }}
        >
          <LDBox sx={{ fontSize: '1.1em', margin: '1em 0 0 0' }}>Shared Secret Participants</LDBox>
          <Button
            key={'Refresh'}
            onClick={() => {
              wrap('Update Users', () => updateUsers());
            }}
          >
            Refresh
          </Button>
        </Stack>
        {users.length ? (
          <TableContainer key="table" component={Paper}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell key={'index'}>Index</TableCell>
                  <TableCell key={'inserted'}>User</TableCell>
                  <TableCell key={'encrapted-secret'}>Encrypted Secret</TableCell>
                  <TableCell key={'action'}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((row) => (
                  <TableRow
                    sx={{ cursor: 'pointer' }}
                    hover={true}
                    onClick={() => {
                      setNewUser(row.user);
                    }}
                    key={row.user}
                  >
                    <TableCell key={'index'}>{row.index}</TableCell>
                    <TableCell key={'name'}>{row.user}</TableCell>
                    <TableCell key={'encryptedSecret'}>{display64(row.encryptedSecret)}</TableCell>
                    <TableCell key={'action'}>
                      {row.encryptedSecret === '-' ? (
                        <Button onClick={() => setNewUser(row.user)}>Select</Button>
                      ) : (
                        <Button
                          onClick={async () => {
                            if (!sharedSecretStore) {
                              return;
                            }
                            await wrap('Clear users entry', () =>
                              sharedSecretStore.removeEncryptedSecret(row.user, publicAddress)
                            );

                            await wrap('Update Users', () => updateUsers());
                          }}
                        >
                          Clear
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <LDBox>No Participants yet!</LDBox>
        )}
        <Stack direction={'row'} justifyContent="space-between" alignItems="center" spacing={2} mb={'1em'}>
          <TextField
            size={'small'}
            fullWidth={true}
            label={'Additional User'}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewUser(e.target.value)}
            value={newUser}
          />

          <Button
            key={'Add User'}
            disabled={!newUser}
            sx={{ whiteSpace: 'nowrap' }}
            onClick={async () => {
              if (sharedSecretStore && web3Session) {
                const encryptedSecret = await sharedSecretStore.getUserEncryptedSecret(publicAddress, publicAddress);

                if (isStatusMessage(encryptedSecret)) {
                  setStatusMessage(encryptedSecret);
                  return;
                }

                const secret = await web3Session.decryptFun(new Uint8Array(Buffer.from(encryptedSecret, 'base64')));

                if (!secret) {
                  return;
                }

                const encryptedSecret4User = await encryptForUser(wrap, newUser, secret, publicKeyStore);
                if (isStatusMessage(encryptedSecret4User)) {
                  setStatusMessage(encryptedSecret4User);
                  return;
                }
                if (!sharedSecretStore) {
                  return;
                }

                const encBase64 = Buffer.from(encryptedSecret4User).toString('base64');

                await wrap(`Share Secret to ${displayAddress(newUser)}`, () =>
                  sharedSecretStore.setEncryptedSecret(newUser, encBase64, publicAddress)
                );

                await wrap(`Update Participants...`, () => updateUsers());
              }
            }}
          >
            Add User
          </Button>
        </Stack>
      </Stack>
      <SecretDialog secret={secret} close={() => setSecret('')} />
    </Stack>
  );
};

export async function encryptForUser(
  wrap: WrapFun,
  userAddress: string,
  secret: Uint8Array,
  publicKeyStore: PublicKeyStore
): Promise<StatusMessage | Uint8Array> {
  const publicKey = await wrap(`Reading Public Key for ${userAddress} from PublicKeyStore...`, () =>
    publicKeyStore.get(userAddress)
  );

  if (isStatusMessage(publicKey)) {
    return publicKey;
  }
  if (!publicKey) {
    return errorMessage(
      `For the address ${displayAddress(
        userAddress
      )} no Public Key is stored on this Blockchain! Please inform the user of ${displayAddress(
        userAddress
      )} to publish the Public Key to the Public Key Store!`
    );
  }
  const res = await encryptEthCryptoBinary(publicKey, secret);
  if (!res) {
    return errorMessage('Error occurred in: encryptEthCryptoBinary');
  }
  return res;
}

function SecretDialog({ secret, close }: { secret: string; close: NotifyFun }) {
  return (
    <Dialog open={!!secret} onClose={close}>
      <DialogTitle>Contract Secret</DialogTitle>
      <DialogContent>
        <Stack spacing={2} alignItems="flex-end">
          <Base64Display value={secret} label={'Contract Secret'} max={0} />
          <Button onClick={close}>close</Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
