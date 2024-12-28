import { Button, Stack, Tooltip } from '@mui/material';
import { LDBox } from '../common/StyledBoxes';
import TextField from '@mui/material/TextField';
import { ButtonPanel } from '../common/ButtonPanel';
import { addLocalWalletToLocalStorage, createAccountEntry } from './local-wallet-utils';
import { errorMessage, isStatusMessage, NotifyFun, StatusMessage } from '../../types';
import { Wallet } from 'ethers';
import { FC, useState } from 'react';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { PasswordTextField } from '../common/PasswordTextField';

export const AddAccountUi: FC<{ walletPassword: string; refreshLocalWalletList: NotifyFun }> = ({
  walletPassword,
  refreshLocalWalletList
}) => {
  const [name, setName] = useState('');
  const [secret, setSecret] = useState('');
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();

  return (
    <Stack spacing={1} key={'add-account-stack'}>
      <LDBox key={'secrets-title'} sx={{ fontSize: '1.2em', fontWeight: 'bold' }}>
        Add Account
      </LDBox>

      <TextField
        key={'name-field'}
        label={'Name of your secret'}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {/*<TextField*/}
      {/*  key={'secret-field'}*/}
      {/*  label={'Secret (seed phrase or private key)'}*/}
      {/*  value={secret}*/}
      {/*  onChange={(e) => setSecret(e.target.value)}*/}
      {/*/>*/}
      <PasswordTextField
        key={'secret-field'}
        value={secret}
        label={'Secret (seed phrase or private key)'}
        onChange={(e) => setSecret(e.target.value)}
      />
      <ButtonPanel
        key={'buttons'}
        content={[
          <Button
            key={'add-and-connect'}
            disabled={!secret || !name}
            onClick={async () => {
              setStatusMessage(undefined);
              const localWallet = await createAccountEntry({ name, secret, walletPassword });
              if (isStatusMessage(localWallet)) {
                setStatusMessage(localWallet);
                return;
              }
              addLocalWalletToLocalStorage(localWallet);
              refreshLocalWalletList();

              //connectWeb3(getLocalWalletList().length - 1);
            }}
          >
            Add
          </Button>,
          <Tooltip key={'create-account'} title={"Create a random account! DON'T FORGET to write down the seed phrase"}>
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
      <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />
    </Stack>
  );
};
