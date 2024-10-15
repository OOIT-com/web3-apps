import * as React from 'react';
import { FC, useCallback, useEffect, useState } from 'react';
import { isStatusMessage, StatusMessage, warningMessage } from '../../types';
import Button from '@mui/material/Button';

import { StatusMessageElement } from '../common/StatusMessageElement';
import { ContractName } from '../../contracts/contract-utils';
import { useAppContext } from '../AppContextProvider';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import { ethNumberToWei, getContractBalance } from '../../utils/web3-utils';
import { UniversalNameStore } from '../../contracts/universal-name-store/UniversalNameStore-support';
import TableRowComp from '../common/TableRowComp';
import { ButtonPanel } from '../common/ButtonPanel';
import { TableComp } from '../common/TableComp';

export const WithdrawUi: FC<{ universalNameStore: UniversalNameStore }> = ({ universalNameStore }) => {
  const app = useAppContext();
  const { wrap } = app;
  const { web3, publicAddress } = app.web3Session || {};
  const [balance, setBalance] = useState('');
  const [myBalance, setMyBalance] = useState('');
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();

  const refreshData = useCallback(
    () =>
      wrap('Refresh data...', async () => {
        if (universalNameStore && web3 && publicAddress) {
          const balance = await getContractBalance(web3, universalNameStore.contractAddress);
          if (isStatusMessage(balance)) {
            setStatusMessage(balance);
            return;
          }
          setBalance(balance);
          const myBalance = await getContractBalance(web3, publicAddress);
          if (isStatusMessage(myBalance)) {
            setStatusMessage(myBalance);
            return;
          }
          setMyBalance(myBalance);
        }
      }),
    [wrap, universalNameStore, publicAddress, web3]
  );

  useEffect(() => {
    refreshData().catch(console.error);
  }, [refreshData]);

  if (!web3 || !publicAddress) {
    return <StatusMessageElement statusMessage={warningMessage('Web3 is not initialized!')} />;
  }
  if (!universalNameStore) {
    return (
      <StatusMessageElement
        statusMessage={warningMessage(`No contract found for ${ContractName.UNIVERSAL_NAME_STORE}`)}
      />
    );
  }

  return (
    <CollapsiblePanel
      title={'Withdraw'}
      level={'third'}
      collapsible={true}
      collapsed={true}
      content={[
        <StatusMessageElement key={'sm1'} statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />,
        <TableComp
          key={'withdraw-ui'}
          content={[
            <TableRowComp key={'contract-balance'} elements={['Current Contract Balance', `${balance}`]} />,
            <TableRowComp key={'my-balance'} elements={['My Balance', `${myBalance}`]} />,
            <TableRowComp
              key={'buttons'}
              colspan={[2]}
              elements={[
                <ButtonPanel
                  key={'buttons'}
                  content={[
                    <Button
                      key={'withdraw'}
                      variant={'contained'}
                      disabled={balance === '0.' || !balance}
                      onClick={() =>
                        wrap('Withdraw...', async () => {
                          if (universalNameStore) {
                            const res = await universalNameStore.withdraw(ethNumberToWei(balance));
                            if (isStatusMessage(res)) {
                              setStatusMessage(res);
                            } else {
                              await refreshData();
                            }
                          }
                        })
                      }
                    >
                      Withdraw {balance}
                    </Button>,
                    <Button key={'refresh'} onClick={() => refreshData()}>
                      Refresh
                    </Button>
                  ]}
                />
              ]}
            />
          ]}
        />
      ]}
    />
  );
};
