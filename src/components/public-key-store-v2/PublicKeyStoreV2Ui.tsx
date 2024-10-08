import * as React from 'react';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { errorMessage, infoMessage, isStatusMessage, StatusMessage, warningMessage } from '../../types';
import { Box, Button, Stack, TextField } from '@mui/material';
import {
  loadDefaultPublicKeyStoreV2,
  PublicKeyStoreV2
} from '../../contracts/public-key-store/PublicKeyStoreV2-support';
import { AddressBoxWithCopy } from '../common/AddressBoxWithCopy';
import nacl from 'tweetnacl';
import { decryptBuffer } from '../../utils/metamask-util';
import { Buffer } from 'buffer';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { LDBox } from '../common/StyledBoxes';
import { displayKey } from '../../utils/enc-dec-utils';
import { useAppContext, WrapFun } from '../AppContextProvider';

export function PublicKeyStoreV2Ui() {
  const { wrap, web3Session, dispatchSnackbarMessage, setPublicKeyHolderV2 } = useAppContext();
  const { publicAddress } = web3Session || {};
  const [myPublicKey, setMyPublicKey] = useState('');
  const [address0, setAddress0] = useState('');
  const [myEncSecretKey0, setMyEncSecretKey0] = useState('');
  const [publicKey0, setPublicKey0] = useState('');
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [publicKeyStoreV2, setPublicKeyStoreV2] = useState<PublicKeyStoreV2>();

  useEffect(() => {
    if (web3Session) {
      wrap('Loading Public Key Store...', async () => loadDefaultPublicKeyStoreV2(web3Session)).then((store) =>
        isStatusMessage(store) ? setStatusMessage(store) : setPublicKeyStoreV2(store)
      );
    }
  }, [wrap, web3Session]);

  const getMine = useCallback(async () => {
    if (publicAddress && publicKeyStoreV2) {
      const myPublicKey0 = await wrap('Reading my Public Key...', () => publicKeyStoreV2.getPublicKey(publicAddress));
      const myEncSecretKey0 = await wrap('Reading my Encrypted Secret Key...', () =>
        publicKeyStoreV2.getEncSecretKey(publicAddress)
      );

      if (isStatusMessage(myPublicKey0) || !myPublicKey0) {
        dispatchSnackbarMessage(infoMessage(`My Public Key (V2) is not available!`));
        setMyPublicKey('');
        return;
      }
      if (isStatusMessage(myEncSecretKey0) || !myEncSecretKey0) {
        dispatchSnackbarMessage(infoMessage(`My Encrypted Private Key (V2) is not available!`));
        setMyEncSecretKey0('');
        return;
      }

      setMyPublicKey(myPublicKey0);
      setMyEncSecretKey0(myEncSecretKey0);
    }
  }, [publicAddress, publicKeyStoreV2, wrap, dispatchSnackbarMessage]);

  const createAndSaveNewPublicKey = useCallback(async () => {
    if (publicAddress && publicKeyStoreV2) {
      const res = await saveNewKeyPair(wrap, publicAddress, publicKeyStoreV2);
      if (isStatusMessage(res)) {
        setStatusMessage(res);
      } else {
        const { publicKey, secretKey } = res;
        setPublicKeyHolderV2({ publicKey, secretKey });
      }
    }
  }, [publicAddress, publicKeyStoreV2, wrap, setPublicKeyHolderV2]);

  const loadAndDispatchKeys = useCallback(async () => {
    if (publicAddress && publicKeyStoreV2) {
      const res = await loadKeyPair(wrap, publicAddress, publicKeyStoreV2);
      if (isStatusMessage(res)) {
        setStatusMessage(res);
        return;
      }
      const { publicKey, secretKey } = res;
      setPublicKeyHolderV2({ publicKey, secretKey });
    }
  }, [publicAddress, publicKeyStoreV2, wrap, setPublicKeyHolderV2]);

  useEffect(() => {
    getMine().catch(console.error);
  }, [getMine]);

  if (!web3Session) {
    return <StatusMessageElement statusMessage={errorMessage(`Web3 not initialized!`)} />;
  }
  if (!publicKeyStoreV2) {
    return <StatusMessageElement statusMessage={errorMessage(`Public Key Store V2 is not available!`)} />;
  }

  return (
    <Stack spacing={2}>
      <Stack sx={{ border: 'solid 2px gray', borderRadius: '', padding: '1em 1em' }} spacing={2}>
        <LDBox sx={{ fontSize: '1.6em', margin: '1em 0 0.4em 0' }}>Manage My Public and Encrypted Secret Keys</LDBox>

        {/*{publicKeyHolderV2 ? (*/}
        {/*  <>*/}
        {/*    <PublicKeyOnNetwork value={publicKeyHolderV2.publicKey} label={'Public Key'} />*/}
        {/*    <PublicKeyOnNetwork value={publicKeyHolderV2.secretKey} label={'Secret Key'} />*/}
        {/*  </>*/}
        {/*) : (*/}
        {/*  <LDBox>No Public Key saved in PublicKeyStoreV2!</LDBox>*/}
        {/*)}*/}

        {myPublicKey && <AddressBoxWithCopy value={myPublicKey} label={'My Public Key (V2)'} reduced={false} />}
        {myEncSecretKey0 && (
          <AddressBoxWithCopy value={myEncSecretKey0} label={'My Encrypted Secret Key (V2)'} reduced={false} />
        )}

        <Stack direction={'row'} spacing={1}>
          <Button key={'load'} onClick={loadAndDispatchKeys}>
            Load Keys
          </Button>
          <Button key={'save'} disabled={!!myPublicKey} onClick={createAndSaveNewPublicKey}>
            Create a New Key Pair and save it...
          </Button>
        </Stack>
      </Stack>

      <Stack sx={{ border: 'solid 2px gray', borderRadius: '', padding: '1em 1em' }} spacing={2}>
        <LDBox sx={{ fontSize: '1.6em', margin: '1em 0 0.4em 0' }}>Read a Public Key </LDBox>
        <Stack direction={'row'} spacing={1}>
          <TextField
            key={'address'}
            autoFocus
            margin="dense"
            label={'For the Address'}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setAddress0(e.target.value);
            }}
            value={address0}
            fullWidth
            variant="standard"
          />
          <Button
            disabled={!address0}
            onClick={async () => {
              if (!publicAddress) {
                return;
              }
              const key = await wrap(`Reading Public Key for ${displayKey(address0)}`, () =>
                publicKeyStoreV2.getPublicKey(address0)
              );
              if (isStatusMessage(key)) {
                dispatchSnackbarMessage(key);
              } else if (key === '') {
                dispatchSnackbarMessage(warningMessage(`Did not find a Public Key for ${displayKey(address0)}`));
              } else {
                setPublicKey0(key);
              }
            }}
          >
            <Box sx={{ whiteSpace: 'nowrap' }}>Get Public Key</Box>
          </Button>
        </Stack>
        {publicKey0 && <AddressBoxWithCopy key={'pub'} value={publicKey0} reduced={false} label={'Public Key'} />}
      </Stack>

      <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />
    </Stack>
  );
}

async function saveNewKeyPair(wrap: WrapFun, from: string, publicKeyStoreV2: PublicKeyStoreV2) {
  return await wrap('Save Public Key and Encrypted Secret Key.', () => publicKeyStoreV2.initMyKeys());
}

async function loadKeyPair(wrap: WrapFun, from: string, publicKeyStoreV2: PublicKeyStoreV2) {
  const res = await wrap('Save Public Key and Encrypted Secret Key.', () => publicKeyStoreV2.getEncSecretKey(from));
  if (isStatusMessage(res)) {
    return res;
  }
  if (!res) {
    return infoMessage(`No Keys found for ${displayKey(from)}!`);
  }
  const buff = Buffer.from(res, 'base64');
  const decSecretKeyBuff = await decryptBuffer(from, buff);
  const secretKey = new Uint8Array(decSecretKeyBuff);
  const { publicKey } = nacl.box.keyPair.fromSecretKey(secretKey);
  return { publicKey, secretKey };
}

export async function getPublicEncryptionKey(from: string) {
  const w = window as any;
  return (await w?.ethereum?.request({
    method: 'eth_getEncryptionPublicKey',
    params: [from]
  })) as string;
}
