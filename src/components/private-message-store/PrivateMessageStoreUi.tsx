import * as React from 'react';
import { useEffect } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import PrivateMessageInBoxUi from './PrivateMessageInBoxUi';
import { PrivateMessageOutBoxUi } from './PrivateMessageOutBoxUi';
import { Paper } from '@mui/material';
import { isStatusMessage, StatusMessage } from '../../types';
import {
  loadPrivateMessageStore,
  PrivateMessageStore
} from '../../contracts/private-message-store/PrivateMessageStore-support';
import { ContractName } from '../../contracts/contract-utils';
import { useAppContext } from '../AppContextProvider';
import { NoContractFound } from '../common/NoContractFound';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import { StatusMessageElement } from '../common/StatusMessageElement';

export function PrivateMessageStoreUi() {
  const [value, setValue] = React.useState(0);
  const { web3Session } = useAppContext();
  const [privateMessageStore, setPrivateMessageStore] = React.useState<PrivateMessageStore>();
  const [statusMessage, setStatusMessage] = React.useState<StatusMessage>();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (web3Session?.web3 && !privateMessageStore) {
      loadPrivateMessageStore(web3Session.web3).then((res) => {
        if (isStatusMessage(res)) {
          setStatusMessage(res);
        } else {
          setPrivateMessageStore(res);
        }
      });
    }
  }, [privateMessageStore, web3Session?.web3]);

  if (!privateMessageStore) {
    return <NoContractFound name={ContractName.PRIVATE_MESSAGE_STORE} />;
  }

  return (
    <CollapsiblePanel
      collapsible={false}
      title={'Private Message Store'}
      content={[
        <StatusMessageElement
          key={'status-message'}
          statusMessage={statusMessage}
          onClose={() => setStatusMessage(undefined)}
        />,
        <Box key={'tabs'} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="Private Inbox" />
            <Tab label="Sent Messages" />
          </Tabs>
        </Box>,
        <Paper key={'panels'} sx={{ margin: '1em 0 1em 0' }}>
          {value === 0 && <PrivateMessageInBoxUi key={'in'} privateMessageStore={privateMessageStore} />}
          {value === 1 && <PrivateMessageOutBoxUi key={'out'} privateMessageStore={privateMessageStore} />}
        </Paper>
      ]}
    />
  );
}
