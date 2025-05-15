import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import { ContractName } from '../../contracts/contract-utils';
import { useAppContext } from '../AppContextProvider';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import { UniversalNameStore } from '../../contracts/universal-name-store/UniversalNameStore-support';
import { Web3NotInitialized } from '../common/Web3NotInitialized';
import { Table, TableBody } from '@mui/material';
import { TableRowComp } from '../common/TableRowComp';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { NoContractFound } from '../common/NoContractFound';
import {infoMessage} from "../../utils/status-message";

export const EventListenerUi: FC<{ universalNameStore: UniversalNameStore }> = ({ universalNameStore }) => {
  const app = useAppContext();
  const { web3, publicAddress } = app.web3Session || {};
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    universalNameStore.registerForEvents((event: string) => setEvents((es) => [event, ...es])).catch(console.error);
  }, [universalNameStore]);

  if (!web3 || !publicAddress) {
    return <Web3NotInitialized />;
  }
  if (!universalNameStore) {
    return <NoContractFound name={ContractName.UNIVERSAL_NAME_STORE} />;
  }

  return (
    <CollapsiblePanel
      collapsible={true}
      collapsed={true}
      level={'second'}
      key={'na'}
      title={'Events'}
      toolbar={[]}
      content={[
        events?.length > 0 ? (
          <Table key={'table'} sx={{ minWidth: 800 }}>
            <TableBody>
              {events.map((event) => (
                <TableRowComp key={event} elements={[event]} />
              ))}
            </TableBody>
          </Table>
        ) : (
          <StatusMessageElement key={'no-events'} statusMessage={infoMessage('No Events')} />
        )
      ]}
    />
  );
};
