import Dialog from '@mui/material/Dialog';
import { errorMessage, isStatusMessage, StatusMessage } from '../../types';
import DialogTitle from '@mui/material/DialogTitle';
import { FC, useCallback, useEffect, useState } from 'react';
import { LDBox } from '../common/StyledBoxes';
import { StatusMessageElement } from '../common/StatusMessageElement';
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
  TableContainer,
  Tooltip
} from '@mui/material';
import TextField from '@mui/material/TextField';
import { TableRowComp } from '../common/TableRowComp';
import { networks } from '../../network-info';
import { connectWithSecret } from './connect-with-secret';
import { useNavigate } from 'react-router-dom';
import { initDapps } from '../init-dapps';
import { useAppContext } from '../AppContextProvider';
import { ButtonPanel } from '../common/ButtonPanel';
import { PasswordTextField } from '../common/PasswordTextField';
import { Wallet } from 'ethers';
import {
  addLocalWalletToLocalStorage,
  createAccountEntry,
  extractPrivateKey,
  getLocalWalletFromLocalStorage,
  getLocalWalletList,
  LocalWalletData,
  removeLocalWalletFromLocalStorage
} from './local-wallet-utils';
import { displayAddress } from '../../utils/misc-util';

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

const w: any = window;
const networkSelection = networks.filter((e) => e.PostFix && e.rpcUrl);

export const LocalWalletConnectDialog: FC<{ walletPassword: string }> = ({ walletPassword }) => {
  const app = useAppContext();
  const navigate = useNavigate();
  const [networkId, setNetworkId] = useState('64165');
  const [name, setName] = useState('');
  const [secret, setSecret] = useState('');
  const [localWalletList, setLocalWalletList] = useState<LocalWalletData[]>([]);
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    const list = getLocalWalletList();
    setLocalWalletList(list);
  }, []);

  const connectWeb3 = useCallback(
    async (index: number): Promise<StatusMessage | undefined> => {
      if (+networkId) {
        const account = getLocalWalletFromLocalStorage(index);
        if (!account) {
          return;
        }

        const privateKey = extractPrivateKey(account, walletPassword);
        if (!privateKey) {
          setStatusMessage(errorMessage(`Can not get private key from account entry ${account.name}`));
          return;
        }

        const web3Session = await connectWithSecret(app, +networkId, privateKey);
        if (web3Session) {
          await initDapps(web3Session, app, navigate);
        } else {
          setStatusMessage(errorMessage('Could not connect with local storage :-('));
        }
      }
    },
    [app, navigate, networkId, walletPassword]
  );

  const selectLabel = 'Select Blockchain';

  const AddPanel = useCallback(
    () => (
      <>
        {' '}
        {showAdd && (
          <Stack spacing={1}>
            <LDBox key={'secrets-title'} sx={{ fontSize: '1.2em', fontWeight: 'bold' }}>
              Add Account
            </LDBox>

            <TextField
              key={'name'}
              label={'Name of your secret'}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <PasswordTextField
              key={'version'}
              value={secret}
              label={'Secret (seed phrase or private key)'}
              onChange={(e) => setSecret(e.target.value)}
            />
            <ButtonPanel
              key={'buttons'}
              content={[
                <Button
                  key={'add-and-connect'}
                  disabled={!secret || !name || !networkId}
                  onClick={async () => {
                    setStatusMessage(undefined);
                    const localWallet = await createAccountEntry({ name, secret, walletPassword });
                    if (isStatusMessage(localWallet)) {
                      setStatusMessage(localWallet);
                      return;
                    }
                    addLocalWalletToLocalStorage(localWallet);
                    setLocalWalletList(getLocalWalletList());
                    //connectWeb3(getLocalWalletList().length - 1);
                  }}
                >
                  Add
                </Button>,
                <Tooltip
                  key={'create-account'}
                  title={"Create a random account! DON'T FORGET to write down the seed phrase"}
                >
                  <Button
                    onClick={() => {
                      setStatusMessage(undefined);
                      const wallet = Wallet.createRandom();
                      const phrase = wallet.mnemonic?.phrase;
                      if (phrase) {
                        const first = phrase.split(' ')[0];
                        setSecret(wallet.mnemonic.phrase);
                        setName(`key-starts-with-${first}`);
                      } else {
                        setStatusMessage(errorMessage('Creating a random wallet failed!'));
                      }
                    }}
                  >
                    Create Random Account
                  </Button>
                </Tooltip>
              ]}
            />
          </Stack>
        )}
        <ButtonPanel>
          <Button
            onClick={() => setShowAdd((b) => !b)}
            sx={{ fontSize: '80%', fontStyle: 'italic', fontWeight: 'bold' }}
          >
            {showAdd ? 'Hide Add' : 'Add Account...'}
          </Button>
        </ButtonPanel>
      </>
    ),
    [name, networkId, secret, showAdd, walletPassword]
  );

  return (
    <Dialog fullWidth={true} maxWidth={'lg'} open={true}>
      <DialogTitle>
        <ButtonPanel key={'dialog-title'} mode={'space-between'}>
          <LDBox
            key={'blockchain-selection'}
            sx={{
              fontSize: '1.2em',
              fontWeight: 'bold'
            }}
          >
            Connect to Network with Local Wallet
          </LDBox>
          <Button variant={'contained'} onClick={() => w?.location?.reload()}>
            Close
          </Button>
        </ButtonPanel>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <StatusMessageElement statusMessage={warningMessage} />
          <LDBox
            key={'blockchain-selection'}
            sx={{
              fontSize: '1.2em',
              fontWeight: 'bold'
            }}
          >
            Network (Blockchain)
          </LDBox>
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
          {localWalletList.length > 0 && (
            <Stack spacing={1}>
              <LDBox key={'secrets-title'} sx={{ fontSize: '1.2em', fontWeight: 'bold' }}>
                Available Accounts
              </LDBox>
              <TableContainer key={'secrets-table'}>
                <Table size="small">
                  <TableBody>
                    {localWalletList.map(({ name, address }, index) => (
                      <TableRowComp
                        key={name}
                        elements={[
                          name,
                          displayAddress(address),
                          <Tooltip key={'select'} title={' Connect with account...'}>
                            <Button onClick={async () => connectWeb3(index)}>Connect</Button>
                          </Tooltip>,
                          <Tooltip key={'remove'} title={'Remove Account from local Wallet...'}>
                            <Button
                              onClick={() => {
                                removeLocalWalletFromLocalStorage(index);
                                setLocalWalletList(getLocalWalletList());
                              }}
                            >
                              Remove
                            </Button>
                          </Tooltip>
                        ]}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          )}
          <AddPanel />
          <StatusMessageElement statusMessage={statusMessage} />
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
