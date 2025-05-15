import * as React from 'react';
import { ChangeEvent, FC, useCallback, useEffect, useMemo, useState } from 'react';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import { Web3Session } from '../../types';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { getNetworkInfo } from '../../network-info';
import { AddressEntryField } from '../address-book/AddressEntryField';
import { ButtonPanel } from '../common/ButtonPanel';
import { Button, Divider } from '@mui/material';
import { getContractBalance, sendAmount } from '../../utils/web3-utils';
import { useAppContext } from '../AppContextProvider';
import { displayAddress } from '../../utils/misc-util';
import { EthTextField } from '../common/EthTextField';
import {errorMessage, isStatusMessage, StatusMessage} from "../../utils/status-message";

export const PaymentPanel: FC<{ web3Session: Web3Session }> = ({ web3Session }) => {
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [receiver, setReceiver] = useState('');
  const [yourBalanceEth, setYourBalanceEth] = useState('0.0');
  const [amountEth, setAmountEth] = useState('0.0');

  const { wrap } = useAppContext();
  const { networkId, publicAddress, web3 } = web3Session;
  const { currencySymbol } = getNetworkInfo(networkId);

  const updateYourBalance = useCallback(
    () =>
      wrap('Reading your balance...', async () => {
        const yourBalance = await getContractBalance(web3, publicAddress);
        if (isStatusMessage(yourBalance)) {
          setStatusMessage(yourBalance);
        } else {
          setYourBalanceEth(yourBalance);
        }
      }),
    [publicAddress, web3, wrap]
  );
  useEffect(() => {
    updateYourBalance().catch(console.error);
  }, [updateYourBalance]);
  const isAmount = typeof +amountEth === 'number' && +amountEth > 0;

  const notyourself = useMemo(() => errorMessage(`You can not sent ${currencySymbol} to yourself!`), [currencySymbol]);
  const setAddressHandler = useCallback(
    (r: string) => {
      setReceiver(r);
      if (r === publicAddress) {
        setStatusMessage(notyourself);
      } else {
        setStatusMessage(undefined);
      }
    },
    [publicAddress, notyourself]
  );

  return (
    <CollapsiblePanel
      level={'second'}
      collapsible={false}
      collapsed={false}
      spacing={2}
      title={`Send ${currencySymbol} to a Receiver Address`}
      content={[
        <StatusMessageElement
          key={'status-message'}
          statusMessage={statusMessage}
          onClose={() => setStatusMessage(undefined)}
        />,
        <EthTextField disabled={true} label={'Your balance'} key={'your-balance'} value={yourBalanceEth} />,
        <Divider key={'divider'} />,
        <AddressEntryField
          label={'Receiver Address'}
          key={'receiver'}
          address={receiver}
          setAddress={setAddressHandler}
        />,

        <EthTextField
          label={'Amount to send'}
          key={'amount'}
          value={amountEth}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setAmountEth(e.target.value || '')}
        />,
        <ButtonPanel
          key={'buttons'}
          mode={'center'}
          content={[
            <Button
              key={'send'}
              variant={'contained'}
              disabled={!isAmount || !receiver}
              onClick={() =>
                wrap(`Sending ${amountEth} to ${displayAddress(receiver)}...`, async () => {
                  setStatusMessage(undefined);
                  const res = await sendAmount(web3Session, receiver, amountEth);
                  setStatusMessage(res);
                  await updateYourBalance();
                })
              }
            >
              Send
            </Button>
          ]}
        />
      ]}
    />
  );
};
