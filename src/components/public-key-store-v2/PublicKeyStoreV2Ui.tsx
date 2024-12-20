import * as React from 'react';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { errorMessage, infoMessage, isStatusMessage, StatusMessage, successMessage, warningMessage } from '../../types';
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
import { displayKey } from '../../utils/enc-dec-utils';
import { useAppContext, WrapFun } from '../AppContextProvider';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import keyPairStorePng from '../images/key-pair-store.png';
import { AppTopTitle } from '../common/AppTopTitle';
import { ButtonPanel } from '../common/ButtonPanel';

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
      setStatusMessage(successMessage(`Key Pair successfully loaded for you (${publicAddress})!`));
    }
  }, [publicAddress, publicKeyStoreV2, wrap, setPublicKeyHolderV2]);

  useEffect(() => {
    getMine().catch(console.error);
  }, [getMine]);

  if (!web3Session) {
    return <StatusMessageElement statusMessage={errorMessage(`Web3 not initialized!`)} />;
  }
  if (!publicKeyStoreV2) {
    return <StatusMessageElement statusMessage={errorMessage(`Key Pair Store is not available!`)} />;
  }

  return (
    <CollapsiblePanel
      collapsible={false}
      level={'top'}
      title={<AppTopTitle title={'Key Pair Store'} avatar={keyPairStorePng} />}
      spacing={2}
    >
      <StatusMessageElement
        key={'status-message'}
        statusMessage={statusMessage}
        onClose={() => setStatusMessage(undefined)}
      />
      <CollapsiblePanel key={'my-key-pair'} collapsible={false} level={'second'} title={'Manage my Key Pair'}>
        {myPublicKey && <AddressBoxWithCopy value={myPublicKey} label={'My Public Key (V2)'} reduced={true} />}
        {myEncSecretKey0 && (
          <AddressBoxWithCopy value={myEncSecretKey0} label={'My Encrypted Secret Key (V2)'} reduced={true} />
        )}

        <ButtonPanel key={'button-panel'} mode={'left'}>
          <Button key={'load'} onClick={loadAndDispatchKeys}>
            Load Key Pair
          </Button>
          <Button key={'create'} disabled={!!myPublicKey} onClick={createAndSaveNewPublicKey}>
            Create and register a Key Pair ...
          </Button>
        </ButtonPanel>
      </CollapsiblePanel>
      <CollapsiblePanel key={'read-a-public-key'} collapsible={false} level={'second'} title={'Read a Public Key'}>
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
            variant="outlined"
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
      </CollapsiblePanel>
    </CollapsiblePanel>
  );
}

async function saveNewKeyPair(wrap: WrapFun, from: string, publicKeyStoreV2: PublicKeyStoreV2) {
  return await wrap('Save Public Key and Encrypted Secret Key.', () => publicKeyStoreV2.initKeys());
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
