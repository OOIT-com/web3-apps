import * as React from 'react';
import { ReactNode, useEffect } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { PrivateMessageInBoxV2Ui } from './PrivateMessageInBoxV2Ui';
import { PrivateMessageOutBoxV2Ui } from './PrivateMessageOutBoxV2Ui';
import { Button, Paper } from '@mui/material';
import { infoMessage, isStatusMessage, StatusMessage } from '../../types';
import { ContractName } from '../../contracts/contract-utils';
import { useAppContext } from '../AppContextProvider';
import { NoContractFound } from '../common/NoContractFound';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import { StatusMessageElement } from '../common/StatusMessageElement';
import privateMessageStorePng from '../images/private-message-store.png';
import { AppTopTitle } from '../common/AppTopTitle';
import {
  loadPrivateMessageStoreV2,
  PrivateMessageStoreV2
} from '../../contracts/private-message-store/PrivateMessageStoreV2-support';
import { ButtonPanel } from '../common/ButtonPanel';

export function PrivateMessageStoreV2Ui() {
  const [value, setValue] = React.useState(0);
  const { wrap, web3Session } = useAppContext();
  const [privateMessageStoreV2, setPrivateMessageStoreV2] = React.useState<PrivateMessageStoreV2>();
  const [statusMessage, setStatusMessage] = React.useState<StatusMessage>();
  const [publicKey, setPublicKey] = React.useState<Uint8Array>();

  useEffect(() => {
    if (web3Session && !privateMessageStoreV2) {
      wrap('Initializing Private Message Store ...', async () => {
        const store = await loadPrivateMessageStoreV2(web3Session);
        if (isStatusMessage(store)) {
          setStatusMessage(store);
          return;
        }
        setPrivateMessageStoreV2(store);
        const pk = await store.getPublicKey();
        if (isStatusMessage(pk)) {
          return;
        }
        setPublicKey(pk);
      });
    }
  }, [privateMessageStoreV2, web3Session, wrap]);

  if (!privateMessageStoreV2) {
    return <NoContractFound name={ContractName.PRIVATE_MESSAGE_STORE_V2} />;
  }

  const content: ReactNode[] = [
    <StatusMessageElement
      key={'status-message'}
      statusMessage={statusMessage}
      onClose={() => setStatusMessage(undefined)}
    />
  ];

  if (!publicKey) {
    content.push(
      <StatusMessageElement
        key={'no-public-key-info'}
        statusMessage={infoMessage('You did not yet create a key pair for the Private Message Store yet.')}
      />
    );
    content.push(
      <ButtonPanel
        key={'button-panel'}
        mode={'center'}
        content={[
          <Button
            variant={'contained'}
            key={'create-a-keypair'}
            onClick={async () => {
              if (privateMessageStoreV2) {
                const publicKeyStoreV2 = await privateMessageStoreV2.getPublicKeyStore();
                const res = await wrap('Initializing key pair...', async () => publicKeyStoreV2.initMyKeys());
                if (isStatusMessage(res)) {
                  setStatusMessage(res);
                } else {
                  setPublicKey(res.publicKey);
                }
              }
            }}
          >
            Yes, create a key pair for me now!
          </Button>
        ]}
      />
    );
  } else {
    content.push(
      <Box key={'tabs'} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={(_: React.SyntheticEvent, newValue: number) => setValue(newValue)}
          aria-label="basic tabs example"
        >
          <Tab label="Private Inbox" />
          <Tab label="Sent Messages" />
        </Tabs>
      </Box>
    );
    content.push(
      <Paper key={'panels'} sx={{ margin: '1em 0 1em 0' }}>
        {value === 0 && <PrivateMessageInBoxV2Ui key={'in'} privateMessageStoreV2={privateMessageStoreV2} />}
        {value === 1 && <PrivateMessageOutBoxV2Ui key={'out'} privateMessageStoreV2={privateMessageStoreV2} />}
      </Paper>
    );
  }

  return (
    <CollapsiblePanel
      collapsible={false}
      title={<AppTopTitle title={'Private Message Store (V2)'} avatar={privateMessageStorePng} />}
      content={content}
    />
  );
}
