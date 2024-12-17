import { errorMessage, StatusMessage, successMessage, warningMessage } from '../../types';
import { FC, useEffect, useState } from 'react';
import { PasswordTextField } from '../common/PasswordTextField';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import walletHelpFile from './LocalWalletPasswordHelp.md';
import { keccakFromString } from '../../utils/ethers-utils';
import { ButtonPanel } from '../common/ButtonPanel';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { removeAllLocalWalletFromLocalStorage } from './local-wallet-utils';

const localStorageWalletPasswordHash = '__EVM_WALLET_PASSWORD_HASH_OOIT__';
const sessionStorageWalletPassword = '__EVM_WALLET_PASSWORD_HASH_OOIT__';
const w: any = window;
export const LocalWalletPasswordDialog: FC<{
  returnWalletPassword: (s: string) => void;
}> = ({ returnWalletPassword }) => {
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();

  const [walletPassword, setWalletPassword] = useState(sessionStorage.getItem(sessionStorageWalletPassword) || '');

  const walletPasswordHash = localStorage.getItem(localStorageWalletPasswordHash);
  const walletPasswordIsCorrect =
    walletPasswordHash && walletPassword && walletPasswordHash === keccakFromString(walletPassword ?? '');

  useEffect(() => {
    if (walletPasswordIsCorrect) {
      sessionStorage.setItem(sessionStorageWalletPassword, walletPassword);
    }
  }, [walletPassword, walletPasswordIsCorrect]);

  return (
    <Dialog open={true} fullWidth={true} maxWidth={'lg'} onClose={() => w?.location?.reload()}>
      <DialogTitle>
        {walletPasswordHash ? 'Connect with Local Wallet' : 'Create New Password for Local Wallet'}
      </DialogTitle>
      <DialogContent>
        <CollapsiblePanel
          level={'third'}
          key={'wallet-password-panel'}
          title={'Local Wallet Login'}
          collapsible={false}
          help={walletHelpFile}
        >
          <PasswordTextField
            name={'web3-app-local-wallet-password'}
            label={walletPasswordHash ? 'Local Wallet Password' : 'Set New Local Wallet Password'}
            key={'wallet-password-input'}
            size={'small'}
            value={walletPassword}
            onChange={(e) => setWalletPassword(e.target.value)}
          />
          <StatusMessageElement statusMessage={statusMessage} />
          <ButtonPanel key={'button-panel'}>
            {walletPasswordHash && (
              <ButtonPanel key={'walletPasswordHash-section'}>
                <Button
                  key={'wallet-login'}
                  onClick={() => {
                    if (walletPasswordIsCorrect) {
                      returnWalletPassword(walletPassword);
                    } else {
                      setStatusMessage(errorMessage('Password is not correct!'));
                    }
                  }}
                >
                  Local Wallet Login
                </Button>
              </ButtonPanel>
            )}
            {!walletPasswordHash && (
              <Button
                key={'wallet-new-password'}
                onClick={() => {
                  setStatusMessage(undefined);
                  if (walletPassword.length < 8) {
                    setStatusMessage(
                      warningMessage('Please use at least 8 characters for your Local Wallet Password!')
                    );
                    return;
                  }
                  const hash = keccakFromString(walletPassword);
                  localStorage.setItem(localStorageWalletPasswordHash, hash);
                  returnWalletPassword(walletPassword);
                }}
              >
                Set New Local Wallet Password
              </Button>
            )}
          </ButtonPanel>
          {walletPasswordHash && (
            <CollapsiblePanel key={'danger-zone'} title={'Danger Zone'} level={'fourth'} collapsed={true}>
              <ButtonPanel key={'button-panel'}>
                <Button
                  key={'wallet-login'}
                  variant={'contained'}
                  color={'warning'}
                  onClick={() => {
                    setStatusMessage(undefined);
                    localStorage.removeItem(localStorageWalletPasswordHash);
                    removeAllLocalWalletFromLocalStorage();
                    setStatusMessage(successMessage('All Local Wallet Data removed!'));
                  }}
                >
                  Delete All Local Wallet Data!
                </Button>
              </ButtonPanel>
            </CollapsiblePanel>
          )}
        </CollapsiblePanel>
      </DialogContent>
    </Dialog>
  );
};
