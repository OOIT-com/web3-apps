import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { errorMessage, isStatusMessage, StatusMessage } from '../../types';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { ContractName } from '../../contracts/contract-utils';
import { useAppContext } from '../AppContextProvider';
import {
  getUniversalNameStore,
  UniversalNameStore
} from '../../contracts/universal-name-store/UniversalNameStore-support';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import { RegisterNameUi } from './RegisterNameUi';
import { OwnerAdminUi } from './OwnerAdminUi';
import { NameListUi } from './NameListUi';
import { Web3NotInitialized } from '../common/Web3NotInitialized';
import uns from '../images/universal-name-store.png';
import { EventListenerUi } from './EventListenerUi';
import { NoContractFound } from '../common/NoContractFound';
import { AppTopTitle } from '../common/AppTopTitle';
import { UniversalNamePropertiesUi } from './UniversalNamePropertiesUi';

export function UniversalNameStoreUi() {
  const app = useAppContext();
  const { wrap, web3Session } = app;
  const { web3, publicAddress } = web3Session || {};
  const [owner, setOwner] = useState('n/a');
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [universalNameStore, setUniversalNameStore] = useState<UniversalNameStore>();

  const refreshData = useCallback(() => {
    wrap(`Loading Universal Name Store ...`, async () => {
      if (!web3Session) {
        setStatusMessage(errorMessage(`Web3 not initialized!`));
        return;
      }
      const universalNameStore = await getUniversalNameStore(web3Session);
      if (isStatusMessage(universalNameStore)) {
        setStatusMessage(universalNameStore);
        return;
      }
      setUniversalNameStore(universalNameStore);
      const owner = await universalNameStore.owb.owner();
      if (isStatusMessage(owner)) {
        setStatusMessage(owner);
      } else {
        setOwner(owner);
      }
    }).catch(console.error);
  }, [wrap, web3Session]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  if (!web3 || !publicAddress) {
    return <Web3NotInitialized />;
  }
  if (!universalNameStore) {
    return <NoContractFound name={ContractName.UNIVERSAL_NAME_STORE} />;
  }

  const isOwner = publicAddress.toLowerCase() === owner.toLowerCase();
  const content = [
    <StatusMessageElement
      key={'status-message'}
      statusMessage={statusMessage}
      onClose={() => setStatusMessage(undefined)}
    />
  ];

  content.push(<RegisterNameUi key={'register-name'} universalNameStore={universalNameStore} />);

  content.push(<NameListUi key={'name-list-ui'} universalNameStore={universalNameStore} />);
  content.push(<UniversalNamePropertiesUi key={'universal-name-properties'} universalNameStore={universalNameStore} />);

  if (isOwner) {
    content.push(<EventListenerUi key={'event-listener-ui'} universalNameStore={universalNameStore} />);
    content.push(<OwnerAdminUi key={'owner-admin'} universalNameStore={universalNameStore} />);
  }
  return (
    <CollapsiblePanel
      title={<AppTopTitle title={'Universal Name Service'} avatar={uns} />}
      level={'top'}
      content={content}
      collapsible={false}
    />
  );
}
