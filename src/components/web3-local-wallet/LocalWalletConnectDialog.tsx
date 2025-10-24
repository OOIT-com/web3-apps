import Dialog from '@mui/material/Dialog';
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
import { TableRowComp } from '../common/TableRowComp';
import { networks } from '../../network-info';
import { connectWithSecret } from './connect-with-secret';
import { useNavigate } from 'react-router-dom';
import { initDapps } from '../init-dapps';
import { useAppContext } from '../AppContextProvider';
import { ButtonPanel } from '../common/ButtonPanel';
import {
  extractPrivateKey,
  getLocalWalletFromLocalStorage,
  getLocalWalletList,
  LocalWalletData,
  removeLocalWalletFromLocalStorage
} from './local-wallet-utils';
import { displayAddress } from '../../utils/misc-util';
import { AddAccountUi } from './AddAccountUi';
import { errorMessage, StatusMessage } from '../../utils/status-message';

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
export const local_wallet_default_network_id = '__LOCAL_WALLET_DEFAULT_NETWORK_ID_OOIT__';
export const LocalWalletConnectDialog: FC<{ walletPassword: string }> = ({ walletPassword }) => {
  const app = useAppContext();
  const navigate = useNavigate();
  const [chainId, setChainId] = useState(localStorage.getItem(local_wallet_default_network_id) ?? '64165');
  const [localWalletList, setLocalWalletList] = useState<LocalWalletData[]>([]);
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    const list = getLocalWalletList();
    setLocalWalletList(list);
  }, []);

  const connectWeb3 = useCallback(
    async (index: number): Promise<StatusMessage | undefined> => {
      if (+chainId) {
        const account = getLocalWalletFromLocalStorage(index);
        if (!account) {
          return;
        }

        const privateKey = extractPrivateKey(account, walletPassword);
        if (!privateKey) {
          setStatusMessage(errorMessage(`Can not get private key from account entry ${account.name}`));
          return;
        }

        const web3Session = await connectWithSecret(app, +chainId, privateKey);
        if (web3Session) {
          await initDapps(web3Session, app, navigate);
        } else {
          setStatusMessage(errorMessage('Could not connect with local storage :-('));
        }
      }
    },
    [app, navigate, chainId, walletPassword]
  );

  const selectLabel = 'Select Blockchain';

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
              key={'chainId'}
              labelId={'network'}
              label={selectLabel}
              value={chainId}
              onChange={(e) => {
                const chainId = e.target.value;
                localStorage.setItem(local_wallet_default_network_id, chainId);
                setChainId(chainId);
              }}
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
          {showAdd ? (
            <AddAccountUi
              key={'show-add-true'}
              walletPassword={walletPassword}
              refreshLocalWalletList={() => setLocalWalletList(getLocalWalletList)}
            />
          ) : (
            <ButtonPanel key={'show-add-false'}>
              <Button
                onClick={() => setShowAdd((b) => !b)}
                sx={{ fontSize: '80%', fontStyle: 'italic', fontWeight: 'bold' }}
              >
                {showAdd ? 'Hide Add' : 'Add Account...'}
              </Button>
            </ButtonPanel>
          )}

          <StatusMessageElement statusMessage={statusMessage} />
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
