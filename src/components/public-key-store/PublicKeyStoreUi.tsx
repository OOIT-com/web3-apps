import * as React from 'react';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { errorMessage, infoMessage, isStatusMessage, StatusMessage, successMessage } from '../../types';
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
import { InfoTableRow } from '../common/InfoTableRow';
import { AppTopTitle } from '../common/AppTopTitle';
import publicKeyPng from '../images/public-key.png';

export function PublicKeyStoreUi() {
  const app = useAppContext();
  const { wrap, web3Session, publicKeyFromStore, setPublicKeyFromStore } = app;

  const { publicKeyHolder, publicAddress, networkId = 0 } = web3Session || {};

  const [address0, setAddress0] = useState('');
  const [publicKey0, setPublicKey0] = useState('');
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();

  const { name } = getNetworkInfo(networkId);
  const publicKeyStore = getPublicKeyStore();

  const refreshMyPublicKey = useCallback(async () => {
    if (!publicAddress || !publicKeyStore) {
      setStatusMessage(infoMessage(`Could not refresh your Public Key!`));
      return;
    }
    const publicKey = await wrap('Reading Public Key...', () => publicKeyStore.get(publicAddress));
    if (isStatusMessage(publicKey)) {
      setStatusMessage(publicKey);
      return;
    }
    if (!publicKey) {
      setStatusMessage(infoMessage(`Your Public Key is not published yet!`));
      return;
    }
    setPublicKeyFromStore(publicKey);
  }, [wrap, publicKeyStore, publicAddress, setPublicKeyFromStore]);

  const getPublicKey = useCallback(
    async (address: string) => {
      if (!address || !publicKeyStore) {
        setStatusMessage(infoMessage(`Could not call getPublicKey!`));
        return;
      }
      setPublicKey0('');
      const publicKey = await wrap('Reading Public Key...', () => publicKeyStore.get(address));
      if (isStatusMessage(publicKey)) {
        setStatusMessage(publicKey);
        return;
      }
      if (!publicKey) {
        setStatusMessage(infoMessage(`Public key not saved for : ${displayAddress(address)}`));
        return;
      } else {
        setPublicKey0(publicKey);
      }
    },
    [wrap, publicKeyStore]
  );

  const saveMine = useCallback(async () => {
    if (!publicAddress || !publicKeyHolder || !publicKeyStore) {
      return;
    }
    const myPub = await wrap('Save Public Key. (Checkout Meta Mask!)', () =>
      publicKeyStore.set({ from: publicAddress, publicKey: publicKeyHolder.publicKey })
    );
    if (isStatusMessage(myPub)) {
      setStatusMessage(myPub);
    } else {
      setStatusMessage(successMessage('Your Public Key saved in store!'));
      setPublicKeyFromStore(myPub);
    }
  }, [setPublicKeyFromStore, wrap, publicAddress, publicKeyHolder, publicKeyStore]);

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
      setPublicKeyFromStore('');
    }
  }, [setPublicKeyFromStore, wrap, publicAddress, publicKeyStore]);

  useEffect(() => {
    if (publicAddress) {
      refreshMyPublicKey().catch(console.error);
    }
  }, [refreshMyPublicKey, publicAddress]);

  if (!publicKeyHolder) {
    return (
      <StatusMessageElement
        statusMessage={errorMessage('Your Public Key is not available. Please try to login again!')}
      />
    );
  }

  if (!publicKeyStore) {
    return <NoContractFound name={ContractName.PUBLIC_KEY_STORE} />;
  }
  const published = publicKeyHolder?.origin === 'public-key-store';
  return (
    <CollapsiblePanel
      level={'top'}
      collapsible={false}
      title={<AppTopTitle title={'Public Key Store'} avatar={publicKeyPng} />}
      content={[
        <StatusMessageElement
          key={'status-message'}
          statusMessage={statusMessage}
          onClose={() => setStatusMessage(undefined)}
        />,
        <CollapsiblePanel
          key={'my-public-key'}
          title={'My Public Key on the Store'}
          content={[
            <TableComp
              content={[
                <InfoTableRow
                  key={'pub'}
                  label={'Your Public Key from the store'}
                  value={<AddressBoxWithCopy key={'from-store'} value={publicKeyFromStore} reduced={false} />}
                />,
                <InfoTableRow
                  key={'web3'}
                  label={'Your Public Key from the Web3 session'}
                  value={<AddressBoxWithCopy key={'from-session'} value={publicKeyHolder.publicKey} reduced={false} />}
                />
              ]}
            />,
            <ButtonPanel
              mode={'left'}
              content={[
                <Button key={'refresh'} onClick={() => refreshMyPublicKey()}>
                  Refresh
                </Button>,
                <Button key={'publish'} disabled={published} onClick={saveMine}>
                  Publish my public key
                </Button>,
                <Button key={'unpublish'} disabled={!published} onClick={unpublishMine}>
                  Un-publish
                </Button>
              ]}
            />
          ]}
        />,

        <CollapsiblePanel
          collapsed={true}
          key={'public-key'}
          level={'second'}
          title={`Read a Public Key from ${name}`}
          content={[
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
            <ButtonPanel
              mode={'left'}
              content={[
                <Button disabled={!address0} onClick={() => getPublicKey(address0)}>
                  Get Public Key
                </Button>
              ]}
            />,
            <AddressBoxWithCopy value={publicKey0} reduced={false} label={'Public Key'} />
          ]}
        />
      ]}
    />
  );
}
