import Dialog from '@mui/material/Dialog';
import { errorMessage, isStatusMessage, NotifyFun, StatusMessage } from '../types';
import DialogTitle from '@mui/material/DialogTitle';
import { useCallback, useState } from 'react';
import { LDBox } from './common/StyledBoxes';
import { StatusMessageElement } from './common/StatusMessageElement';
import DialogContent from '@mui/material/DialogContent';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableContainer
} from '@mui/material';
import TextField from '@mui/material/TextField';
import TableRowComp from './common/TableRowComp';
import { networks } from '../network-info';
import { connectWithLocalstore } from './connect-with-localstore';
import { useNavigate } from 'react-router-dom';
import { initDapps } from './init-dapps';
import { useAppContext } from './AppContextProvider';
import { ButtonPanel } from './common/ButtonPanel';
import { Wallet } from 'alchemy-sdk';

const warningMessage: StatusMessage = {
  status: 'warning',
  userMessage: `
Sharing your secret, while necessary for our service, 
always carries a degree of risk. For absolute certainty, 
reviewing our source code is recommended. We assure you
 that we prioritize the confidentiality of your secret 
 and implement robust security measures. Your private keys
  remain exclusively within your local browser storage, ensuring their utmost protection.

`
};

const networkSelection = networks.filter((e) => e.PostFix && e.rpcUrl);

export function ConnectWithLocalstore({ done }: Readonly<{ done: NotifyFun }>) {
  const app = useAppContext();
  const navigate = useNavigate();
  const [networkId, setNetworkId] = useState('4002');
  const [name, setName] = useState('');
  const [secret, setSecret] = useState('');
  const [secretList, setSecretList] = useState(getSecretList());
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();

  const connectWeb3 = useCallback(
    async ({ networkId, secret }: { networkId: string; secret: string }): Promise<StatusMessage | undefined> => {
      if (+networkId) {
        const web3Session = await connectWithLocalstore(app, +networkId, secret);
        if (web3Session) {
          await initDapps(web3Session, app, navigate);
        } else {
          return errorMessage('Could not connect with local storage :-(');
        }
      }
    },
    [app, navigate]
  );

  const selectLabel = 'Select Blockchain';
  return (
    <Dialog open={true} onClose={done}>
      <DialogTitle>Connect with Browsers Local Storage</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <StatusMessageElement statusMessage={warningMessage}></StatusMessageElement>
          <FormControl fullWidth={true}>
            <InputLabel id={'network'}>{selectLabel}</InputLabel>
            <Select
              key={'networkId'}
              labelId={'network'}
              label={selectLabel}
              value={networkId}
              onChange={(e) => setNetworkId(e.target.value)}
            >
              {networkSelection.map((e) => (
                <MenuItem key={e.chainId} value={e.chainId}>
                  {e.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {secretList.length > 0 && (
            <Stack spacing={1}>
              <LDBox key={'secrets-title'} sx={{ fontSize: '1.2em', fontWeight: 'bold' }}>
                Available Secrets
              </LDBox>
              <TableContainer key={'secrets-table'}>
                <Table>
                  <TableBody>
                    {secretList.map(({ name, secret }) => (
                      <TableRowComp
                        key={name}
                        elements={[
                          name,
                          <Button
                            key={'select'}
                            onClick={async () => {
                              const res = await connectWeb3({ networkId, secret });
                              if (isStatusMessage(res)) {
                                setStatusMessage(res);
                              } else {
                                done();
                              }
                            }}
                          >
                            Select
                          </Button>,
                          <Button
                            key={'remove'}
                            onClick={() => {
                              removeSecretToLocalStorage(name);
                              setSecretList(getSecretList);
                            }}
                          >
                            Remove
                          </Button>
                        ]}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          )}

          <Stack spacing={1}>
            <LDBox key={'secrets-title'} sx={{ fontSize: '1.2em', fontWeight: 'bold' }}>
              Add Secret
            </LDBox>

            <TextField
              key={'name'}
              label={'Name of your secret'}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              type={'password'}
              value={secret}
              label={'Secret (passphrase or private key)'}
              onChange={(e) => setSecret(e.target.value)}
            />
            <ButtonPanel
              key={'buttons'}
              content={[
                <Button
                  key={'add-and-connect'}
                  disabled={!secret || !name || !networkId}
                  onClick={async () => {
                    addSecretToLocalStorage(name, secret);
                    const res = await connectWeb3({ networkId, secret });
                    if (isStatusMessage(res)) {
                      setStatusMessage(res);
                    } else {
                      done();
                    }
                  }}
                >
                  Add & Connect
                </Button>,
                <Button
                  key={'create-account'}
                  onClick={() => {
                    const wallet = Wallet.createRandom();
                    const phrase = wallet.mnemonic.phrase;
                    const first = phrase.split(' ')[0];
                    setSecret(wallet.mnemonic.phrase);
                    setName(`key-starts-with-${first}`);
                  }}
                >
                  Create Random Account
                </Button>
              ]}
            />
          </Stack>
          <StatusMessageElement statusMessage={statusMessage} />
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

const localStorageEVMName = '__EVM_SECRET_STORAGE_OOIT__';

function addSecretToLocalStorage(name: string, secret: string) {
  const s = localStorage.getItem(localStorageEVMName);
  let storage: Record<string, string> = {};
  if (s) {
    storage = JSON.parse(s) as Record<string, string>;
  }
  storage = { ...storage, [name]: secret };
  localStorage.setItem(localStorageEVMName, JSON.stringify(storage));
}

function removeSecretToLocalStorage(name: string) {
  const s = localStorage.getItem(localStorageEVMName);
  let storage: Record<string, string> = {};
  if (s) {
    storage = JSON.parse(s) as Record<string, string>;
  }

  delete storage[name];
  localStorage.setItem(localStorageEVMName, JSON.stringify(storage));
}

function getSecretList() {
  const s = localStorage.getItem(localStorageEVMName);
  let storage: Record<string, string> = {};
  if (s) {
    storage = JSON.parse(s) as Record<string, string>;
  }
  const keysSorted = Object.keys(storage).sort((a, b) => a.localeCompare(b));
  return keysSorted.map((name) => ({ name, secret: storage[name] }));
}
