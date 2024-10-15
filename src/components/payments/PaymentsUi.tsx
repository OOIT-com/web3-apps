import * as React from 'react';
import { AppTopTitle } from '../common/AppTopTitle';
import paymentsImg from '../images/payments.png';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import { useAppContext } from '../AppContextProvider';
import { Web3NotInitialized } from '../common/Web3NotInitialized';
import { PaymentPanel } from './PaymentPanel';

export function PaymentsUi() {
  const { web3Session } = useAppContext();
  if (!web3Session) {
    return <Web3NotInitialized />;
  }
  return (
    <CollapsiblePanel
      level={'top'}
      collapsible={false}
      collapsed={false}
      title={<AppTopTitle title={'Payments'} avatar={paymentsImg} />}
      content={[<PaymentPanel key={'payment-panel'} web3Session={web3Session} />]}
    />
  );
}
