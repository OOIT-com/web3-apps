import * as React from 'react';
import { FC, useState } from 'react';

import { StatusMessageElement } from '../common/StatusMessageElement';
import { ContractName } from '../../contracts/contract-utils';
import { useAppContext } from '../AppContextProvider';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import { UniversalNameStore } from '../../contracts/universal-name-store/UniversalNameStore-support';
import { WithdrawUi } from './WithdrawUi';
import { SetFeeUi } from './SetFeeUi';
import { Web3NotInitialized } from '../common/Web3NotInitialized';
import { NoContractFound } from '../common/NoContractFound';
import {StatusMessage} from "../../utils/status-message";

export const OwnerAdminUi: FC<{ universalNameStore: UniversalNameStore }> = ({ universalNameStore }) => {
  const app = useAppContext();
  const { web3, publicAddress } = app.web3Session || {};
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();

  if (!web3 || !publicAddress) {
    return <Web3NotInitialized />;
  }
  if (!universalNameStore) {
    return <NoContractFound name={ContractName.UNIVERSAL_NAME_STORE} />;
  }

  return (
    <CollapsiblePanel
      title={'Admin (Owner only)'}
      level={'second'}
      collapsible={true}
      collapsed={true}
      content={[
        <StatusMessageElement key={'sm1'} statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />,
        <SetFeeUi key={'set-fee-ui'} universalNameStore={universalNameStore} />,
        <WithdrawUi key={'withdraw-ui'} universalNameStore={universalNameStore} />
      ]}
    />
  );
};
