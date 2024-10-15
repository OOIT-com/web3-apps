import * as React from 'react';
import { ChangeEvent, useCallback, useState } from 'react';
import { Button, Stack, Tooltip } from '@mui/material';
import { Wallet } from 'alchemy-sdk';
import { StyledHead } from '../common/StyledHead';
import { errorMessage, StatusMessage, warningMessage } from '../../types';
import { AddressBoxWithCopy } from '../common/AddressBoxWithCopy';
import { mmPublicEncryptionKey } from '../../utils/nacl-util';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { TextFieldWithCopy } from '../common/TextFieldWithCopy';

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
  }, []);

  const convertToKeys = useCallback((seedPhrase: string) => {
    try {
      setStatusMessage(undefined);
      const wallet = Wallet.fromMnemonic(seedPhrase);
      setPrivateKey(wallet.privateKey);
      setPublicAddress(wallet.address);
      setPublicKey(wallet.publicKey);
    } catch (e) {
      setStatusMessage(errorMessage('Did you provide 12 words from the Seed Phrase?', e));
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
              New
            </Button>
          </Tooltip>
          <Tooltip title={'Clear entries...'}>
            <Button key={'random'} disabled={!seedPhrase} onClick={clear}>
              Clear
            </Button>
          </Tooltip>
        </Stack>
      </Stack>
      <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />
      <Stack key={'seed-phrase'} direction={'row'}>
        <TextFieldWithCopy
          placeholder={'provide seed phrase or click <Random>'}
          fullWidth={true}
          size={'small'}
          label={'Seed Phrase'}
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
