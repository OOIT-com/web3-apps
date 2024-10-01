import * as React from 'react';
import { FC, useCallback, useEffect, useState } from 'react';
import { isStatusMessage, StatusMessage, warningMessage } from '../../types';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import { StatusMessageElement } from '../common/StatusMessageElement';
import { ContractName } from '../../contracts/contract-utils';
import { useAppContext } from '../AppContextProvider';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import { ethNumberToWei, weiToEther } from '../../utils/web3-utils';
import { UniversalNameStore } from '../../contracts/universal-name-store/UniversalNameStore-support';
import TableRowComp from '../common/TableRowComp';
import { ButtonPanel } from '../common/ButtonPanel';
import { TableComp } from '../common/TableComp';

export const SetFeeUi: FC<{ universalNameStore: UniversalNameStore }> = ({ universalNameStore }) => {
  const app = useAppContext();
  const { wrap } = app;
  const { web3, publicAddress } = app.web3Session || {};
  const [feeUpdate, setFeeUpdate] = useState('0');
  const [helperText, setHelperText] = useState('Add a deciaml number.');
  const [hasError, setHasErrors] = useState(false);
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();

  const refreshData = useCallback(
    () =>
      wrap('Refresh data...', async () => {
        if (universalNameStore && web3 && publicAddress) {
          const res = await universalNameStore.getFee();
          if (isStatusMessage(res)) {
            setStatusMessage(res);
          } else {
            setFeeUpdate(weiToEther(res));
          }
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
      title={'Fee'}
      level={'third'}
      collapsible={true}
      collapsed={true}
      content={[
        <StatusMessageElement key={'sm1'} statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />,

        <TableComp
          key={'set-fee'}
          content={[
            <TableRowComp
              key={'fee-entry'}
              elements={[
                'Fee',
                <TextField
                  value={feeUpdate}
                  error={hasError}
                  helperText={helperText}
                  onChange={(e) => {
                    const s: string = e.target.value;
                    const n = +s;
                    if (isNaN(n)) {
                      setHelperText('Value is not a number!');
                      setHasErrors(true);
                    } else {
                      setHelperText('Wei: ' + ethNumberToWei(n));
                      setHasErrors(false);
                    }
                    setFeeUpdate(s);
                  }}
                  fullWidth
                  label={'Current Fee'}
                />
              ]}
            />,
            <TableRowComp
              key={'buttons'}
              colspan={[2]}
              elements={[
                <ButtonPanel
                  content={[
                    <Button
                      key={'save'}
                      disabled={hasError}
                      onClick={async () => {
                        const res = await wrap('Set fee...', async () => {
                          if (universalNameStore) {
                            return universalNameStore.setFee(ethNumberToWei(feeUpdate));
                          }
                        });
                        if (isStatusMessage(res)) {
                          setStatusMessage(res);
                        }
                      }}
                    >
                      Update Fee
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
