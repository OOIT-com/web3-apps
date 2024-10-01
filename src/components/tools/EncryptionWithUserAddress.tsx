import * as React from 'react';
import { ChangeEvent, useCallback, useState } from 'react';
import { Button, Stack, TextField } from '@mui/material';
import { StyledHead } from '../common/StyledHead';
import { errorMessage, isStatusMessage, StatusMessage } from '../../types';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { displayAddress } from '../../utils/misc-util';
import { getPublicKeyStore } from '../../contracts/public-key-store/PublicKeyStore-support';

import { useAppContext } from '../AppContextProvider';
import { encryptText } from '../../utils/enc-dec-utils';

export function EncryptionWithUserAddress() {
  const { wrap, web3Session } = useAppContext();
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [userAddress, setUserAddress] = useState('');
  const [inText, setInText] = useState('');
  const [encText, setEncText] = useState('');

  const clear = useCallback(() => {
    setInText('');
    setUserAddress('');
    setEncText('');
  }, []);

  if (!web3Session) {
    return <StatusMessageElement statusMessage={errorMessage('Web3 not initialized!')} />;
  }
  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ borderBottom: 'solid 2px gray' }}
      >
        <StyledHead>Encrypt Text for User</StyledHead>

        <Stack direction={'row'}>
          <Button
            disabled={!inText}
            key={'decrypt'}
            onClick={async () => {
              setStatusMessage(undefined);
              const userPublicKey = await wrap(`Reading Public Key for ${displayAddress(userAddress)}...`, () => {
                const publicKeyStore = getPublicKeyStore();
                if (!publicKeyStore) {
                  return Promise.resolve(errorMessage('Public Keystore not available!'));
                }
                return publicKeyStore.get(userAddress);
              });
              if (isStatusMessage(userPublicKey)) {
                setStatusMessage(userPublicKey);
                return;
              }
              const res = encryptText(inText, userPublicKey);
              if (isStatusMessage(res)) {
                setStatusMessage(res);
              } else {
                setEncText(res);
              }
            }}
          >
            Encrypt
          </Button>
          <Button key={'clear'} disabled={!inText || !userAddress || !encText} onClick={clear}>
            Clear
          </Button>
        </Stack>
      </Stack>

      <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />

      <Stack key={'user-address'} direction={'row'}>
        <TextField
          placeholder={'0x...'}
          fullWidth={true}
          size={'small'}
          label={'User Address'}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setUserAddress(e.target.value)}
          value={userAddress}
        />
      </Stack>

      {/*<AddressBoxWithCopy key={'public-key'} value={userPublicKey} label={'Receiver Public Key'} reduced={false} />*/}

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

      {!!encText && (
        <Stack key={'enc-text'} direction={'row'}>
          <TextField
            fullWidth={true}
            size={'small'}
            label={'Encrypted Text'}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEncText(e.target.value)}
            value={encText}
          />
        </Stack>
      )}
    </Stack>
  );
}
