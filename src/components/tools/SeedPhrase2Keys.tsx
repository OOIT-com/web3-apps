import * as React from 'react';
import { ChangeEvent, useCallback, useState } from 'react';
import { Button, Stack, Tooltip } from '@mui/material';
import { Wallet } from 'alchemy-sdk';
import { StyledHead } from '../common/StyledHead';
import { AddressBoxWithCopy } from '../common/AddressBoxWithCopy';
import { mmPublicEncryptionKey } from '../../utils/nacl-util';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { TextFieldWithCopy } from '../common/TextFieldWithCopy';
import {errorMessage, StatusMessage, warningMessage} from "../../utils/status-message";

export function SeedPhrase2Keys() {
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [seedPhrase, setSeedPhrase] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [publicAddress, setPublicAddress] = useState('');
  let _mmPublicEncryptionKey = '';
  if (privateKey) {
    _mmPublicEncryptionKey = mmPublicEncryptionKey(privateKey);
  }

  const clear = useCallback(() => {
    setPrivateKey('');
    setPublicAddress('');
    setPublicKey('');
    setSeedPhrase('');
    setStatusMessage(undefined);
  }, []);

  const convertToKeys = useCallback((seedPhrase: string) => {
    try {
      setStatusMessage(undefined);
      const wallet = new Wallet(seedPhrase);
      setPrivateKey(wallet.privateKey);
      setPublicAddress(wallet.address);
      setPublicKey(wallet.publicKey);
      return;
    } catch (e) {
      //setStatusMessage(errorMessage('Did you provide 12 words from the Seed Phrase?', e));
    }

    try {
      setStatusMessage(undefined);
      const wallet = Wallet.fromMnemonic(seedPhrase);
      setPrivateKey(wallet.privateKey);
      setPublicAddress(wallet.address);
      setPublicKey(wallet.publicKey);
    } catch (e) {
      setStatusMessage(errorMessage('Did you provide 12 words from the Seed Phrase or a correct Private Key?', e));
    }
  }, []);

  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ borderBottom: 'solid 2px gray' }}
      >
        <StyledHead>Seed Phrase & Keys</StyledHead>

        <Stack direction={'row'}>
          <Button disabled={!seedPhrase} key={'convert'} onClick={() => convertToKeys(seedPhrase)}>
            Create keys
          </Button>
          <Tooltip title={'Create a new seed phrase...'}>
            <Button
              key={'random'}
              disabled={!!seedPhrase}
              onClick={() => {
                try {
                  setStatusMessage(undefined);
                  const wallet = Wallet.createRandom();
                  setSeedPhrase(wallet.mnemonic.phrase);
                  convertToKeys(wallet.mnemonic.phrase);
                  setStatusMessage(warningMessage('Keep Seed Phrase and Keys secred!'));
                } catch (e) {
                  setStatusMessage(errorMessage('Did you provide 12 words from the Seed Phrase?', e));
                }
              }}
            >
              New Random Key
            </Button>
          </Tooltip>
          <Tooltip title={'Clear entries...'}>
            <Button key={'random'} disabled={!(seedPhrase || statusMessage)} onClick={clear}>
              Clear
            </Button>
          </Tooltip>
        </Stack>
      </Stack>
      <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />
      <Stack key={'seed-phrase'} direction={'row'}>
        <TextFieldWithCopy
          placeholder={'Provide seed phrase or private key or click <New Random Key>'}
          fullWidth={true}
          size={'small'}
          label={'Seed Phrase or Private Key'}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSeedPhrase(e.target.value)}
          value={seedPhrase}
        />
      </Stack>

      <AddressBoxWithCopy key={'publicAddress'} value={publicAddress} label={'Public Address'} reduced={false} />
      <AddressBoxWithCopy key={'publicKey'} value={publicKey} label={'Full Public Key'} reduced={false} />
      <AddressBoxWithCopy key={'privateKey'} value={privateKey} label={'Private Key'} reduced={false} />
      <AddressBoxWithCopy
        key={'mm-public-encryption-key'}
        value={_mmPublicEncryptionKey}
        label={'MetaMask Public Encryption Key'}
        reduced={false}
      />
    </Stack>
  );
}
