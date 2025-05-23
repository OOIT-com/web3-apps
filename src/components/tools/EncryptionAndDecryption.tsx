import * as React from 'react';
import { ChangeEvent, useCallback, useState } from 'react';
import { Button, Stack, TextField, Tooltip } from '@mui/material';
import { StyledHead } from '../common/StyledHead';
import { AddressBoxWithCopy } from '../common/AddressBoxWithCopy';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { useAppContext } from '../AppContextProvider';
import { decryptText } from '../../utils/enc-dec-utils';
import { TextFieldWithCopy } from '../common/TextFieldWithCopy';
import { encryptEthCrypto } from '../../utils/eth-crypto-utils';
import {errorMessage, isStatusMessage, StatusMessage} from "../../utils/status-message";

export function EncryptionAndDecryption() {
  const { wrap, web3Session } = useAppContext();
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [inText, setInText] = useState('');
  const [encText, setEncText] = useState('');
  const [decText, setDecText] = useState('');

  const clear = useCallback(() => {
    setInText('');
    setEncText('');
    setDecText('');
  }, []);

  if (!web3Session) {
    return <StatusMessageElement statusMessage={errorMessage('Web3 not initialized!')} />;
  }
  const { decryptFun } = web3Session;
  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ borderBottom: 'solid 2px gray' }}
      >
        <StyledHead>Encrypt with Public Key, Decrypt with Secret Key</StyledHead>

        <Stack direction={'row'}>
          <Button
            disabled={!inText}
            key={'encrypt'}
            onClick={async () => {
              setStatusMessage(undefined);
              if (!web3Session.publicKey) {
                setStatusMessage(errorMessage('No public key available! Can not encrypt!'));
                return;
              }
              const res = await encryptEthCrypto(web3Session.publicKey, inText);
              if (!res) {
                setStatusMessage(errorMessage('Could not encrypt text!'));
              } else {
                setEncText(res);
              }
            }}
          >
            Encrypt
          </Button>
          <Button
            disabled={!encText}
            key={'decrypt'}
            onClick={async () => {
              setStatusMessage(undefined);
              const res = await wrap('Processing Decryption...', () => decryptText(encText, decryptFun));
              if (isStatusMessage(res)) {
                setStatusMessage(res);
              } else {
                setDecText(res);
              }
            }}
          >
            Decrypt
          </Button>
          <Tooltip title={'Clear entries...'}>
            <Button key={'random'} disabled={!inText} onClick={clear}>
              Clear
            </Button>
          </Tooltip>
        </Stack>
      </Stack>

      <AddressBoxWithCopy key={'public-key'} value={web3Session.publicKey ?? ''} label={'Public Key'} reduced={false} />
      <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />

      <Stack key={'in-text'} direction={'row'}>
        <TextField
          placeholder={'Just a text...'}
          fullWidth={true}
          size={'small'}
          label={'Text to Encrypt'}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setInText(e.target.value)}
          value={inText}
        />
      </Stack>

      <Stack key={'enc-text'} direction={'row'}>
        <TextFieldWithCopy
          fullWidth={true}
          size={'small'}
          label={'Encrypted Text'}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEncText(e.target.value)}
          value={encText}
        />
      </Stack>

      <Stack key={'dec-text'} direction={'row'}>
        <TextField
          multiline={true}
          fullWidth={true}
          disabled={true}
          size={'small'}
          label={'Decrypted Text'}
          value={decText}
        />
      </Stack>
    </Stack>
  );
}
