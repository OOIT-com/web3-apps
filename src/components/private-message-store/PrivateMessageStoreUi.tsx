import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import PrivateMessageInBoxUi from './PrivateMessageInBoxUi';
import { PrivateMessageOutBoxUi } from './PrivateMessageOutBoxUi';
import { Paper } from '@mui/material';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { warningMessage } from '../../types';
import { getPrivateMessageStore } from '../../contracts/private-message-store/PrivateMessageStore-support';
import { ContractName } from '../../contracts/contract-utils';

export function PrivateMessageStoreUi() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const privateMessageStore = getPrivateMessageStore();
  if (!privateMessageStore) {
    return (
      <StatusMessageElement
        statusMessage={warningMessage(`No contract found for ${ContractName.PRIVATE_MESSAGE_STORE}!`)}
      />
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Private Inbox" />
          <Tab label="Sent Messages" />
        </Tabs>
      </Box>
      <Paper sx={{ margin: '1em 0 1em 0' }}>
        {value === 0 && <PrivateMessageInBoxUi privateMessageStore={privateMessageStore} />}
        {value === 1 && <PrivateMessageOutBoxUi privateMessageStore={privateMessageStore} />}
      </Paper>
    </Box>
  );
}
