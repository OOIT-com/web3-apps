import * as React from 'react';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { AddressBoxWithCopy } from '../common/AddressBoxWithCopy';
import { getNetworkInfo } from '../../network-info';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { getPublicKeyStore } from '../../contracts/public-key-store/PublicKeyStore-support';
import { useAppContext } from '../AppContextProvider';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import { ButtonPanel } from '../common/ButtonPanel';
import { displayAddress } from '../../utils/misc-util';
import { NoContractFound } from '../common/NoContractFound';
import { ContractName } from '../../contracts/contract-utils';
import { TableComp } from '../common/TableComp';
import { TableRowInfo } from '../common/TableRowInfo';
import { AppTopTitle } from '../common/AppTopTitle';
import publicKeyPng from '../images/public-key.png';
import { Web3NotInitialized } from '../common/Web3NotInitialized';
import {infoMessage, isStatusMessage, StatusMessage, successMessage} from "../../utils/status-message";

export function PublicKeyStoreUi() {
  const app = useAppContext();
  const { wrap, web3Session } = app;

  const { publicKey = '', publicAddress, networkId = 0 } = web3Session || {};

  const [address0, setAddress0] = useState('');
  const [publicKey0, setPublicKey0] = useState('');
  const [publicKeyFromStore, setPublicKeyFromStore] = useState('');
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [statusMessage0, setStatusMessage0] = useState<StatusMessage>();

  const { name } = getNetworkInfo(networkId);
  const publicKeyStore = getPublicKeyStore();

  const getPublicKey = useCallback(
    async (address = ''): Promise<StatusMessage | string> => {
      if (!address || !publicKeyStore) {
        return '';
      }
      return await wrap(`Reading Public Key for ${displayAddress(address)}...`, () => publicKeyStore.get(address));
    },
    [wrap, publicKeyStore]
  );

  const refreshMyPublicKey = useCallback(async () => {
    setPublicKeyFromStore('');
    setStatusMessage(undefined);
    const publicKey = await getPublicKey(publicAddress);
    if (isStatusMessage(publicKey)) {
      setStatusMessage(publicKey);
    } else if (!publicKey) {
      setStatusMessage(infoMessage(`Your Public Key is not published yet!`));
    } else {
      setPublicKeyFromStore(publicKey);
    }
  }, [getPublicKey, publicAddress]);

  const getPublicKey0 = useCallback(
    async (address: string) => {
      setPublicKey0('');
      setStatusMessage0(undefined);
      const publicKey = await getPublicKey(address);
      if (isStatusMessage(publicKey)) {
        setStatusMessage0(publicKey);
        return;
      }
      if (!publicKey) {
        setStatusMessage0(infoMessage(`No Public key found for : ${displayAddress(address)}!`));
        return;
      }
      setPublicKey0(publicKey);
    },
    [getPublicKey]
  );

  const savePublicKey = useCallback(async () => {
    setStatusMessage(undefined);
    if (!publicAddress || !publicKeyStore) {
      return;
    }
    const myPub = await wrap('Save Public Key.', () => publicKeyStore.set({ from: publicAddress, publicKey }));
    if (isStatusMessage(myPub)) {
      setStatusMessage(myPub);
    } else {
      setStatusMessage(successMessage('Your Public Key saved in store!'));
      await refreshMyPublicKey();
    }
  }, [publicAddress, publicKeyStore, wrap, publicKey, refreshMyPublicKey]);

  const unpublishMine = useCallback(async () => {
    if (!publicAddress || !publicKeyStore) {
      console.warn('Can not unpublish my public key!');
      return;
    }
    const res = await wrap('Unpublish my public key. (Checkout Meta Mask!)', () =>
      publicKeyStore.set({ from: publicAddress, publicKey: '' })
    );
    if (isStatusMessage(res)) {
      setStatusMessage(res);
    } else {
      setStatusMessage(successMessage('Your Public Key un-published in store!'));
      await refreshMyPublicKey();
    }
  }, [publicAddress, publicKeyStore, wrap, refreshMyPublicKey]);

  useEffect(() => {
    if (publicAddress) {
      refreshMyPublicKey().catch(console.error);
    }
  }, [refreshMyPublicKey, publicAddress]);

  if (!publicKey) {
    return <Web3NotInitialized />;
  }

  if (!publicKeyStore) {
    return <NoContractFound name={ContractName.PUBLIC_KEY_STORE} />;
  }
  return (
    <CollapsiblePanel
      level={'top'}
      collapsible={false}
      title={<AppTopTitle title={'Public Key Store'} avatar={publicKeyPng} />}
      content={[
        <CollapsiblePanel
          key={'my-public-key'}
          title={'My Public Key on the Store'}
          content={[
            <StatusMessageElement
              key={'status-message'}
              statusMessage={statusMessage}
              onClose={() => setStatusMessage(undefined)}
            />,
            <TableComp
              key={'my-public-keys'}
              content={[
                <TableRowInfo
                  key={'web3'}
                  label={'Your Public Key from the Web3 session'}
                  value={<AddressBoxWithCopy key={'from-session'} value={publicKey} reduced={true} />}
                />,
                <TableRowInfo
                  key={'pub'}
                  label={'Your Public Key from the store'}
                  value={<AddressBoxWithCopy key={'from-store'} value={publicKeyFromStore} reduced={true} />}
                />
              ]}
            />,
            <ButtonPanel
              key={'my-public-keys-actions'}
              mode={'left'}
              content={[
                <Button key={'refresh'} onClick={() => refreshMyPublicKey()}>
                  Refresh
                </Button>,
                <Button key={'publish'} onClick={savePublicKey}>
                  Publish my public key
                </Button>,
                <Button key={'unpublish'} onClick={unpublishMine}>
                  Un-publish
                </Button>
              ]}
            />
          ]}
        />,

        <CollapsiblePanel
          collapsible={false}
          key={'public-key'}
          level={'second'}
          title={`Read a Public Key from ${name}`}
          content={[
            <StatusMessageElement
              key={'status-message'}
              statusMessage={statusMessage0}
              onClose={() => setStatusMessage(undefined)}
            />,
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
            />,
            <ButtonPanel key={'get-public-key-button'} mode={'left'}>
              <Button disabled={!address0} onClick={() => getPublicKey0(address0)}>
                Get Public Key
              </Button>
            </ButtonPanel>,
            <AddressBoxWithCopy key={'public-key-display'} value={publicKey0} reduced={true} label={'Public Key'} />
          ]}
        />
      ]}
    />
  );
}
