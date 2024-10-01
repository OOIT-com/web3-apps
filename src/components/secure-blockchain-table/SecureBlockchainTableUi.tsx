import * as React from 'react';
import { FC, useCallback, useEffect } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { Paper } from '@mui/material';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { infoMessage, NotifyFun, warningMessage } from '../../types';
import { getPrivateMessageStore } from '../../contracts/private-message-store/PrivateMessageStore-support';
import { ContractName } from '../../contracts/contract-utils';
import { SecureBlockchainTableListUi } from './SecureBlockchainTableListUi';
import { SecureBlockchainTableEditorUi } from './SecureBlockchainTableEditorUi';
import { SBTManager } from '../../contracts/secure-blockchain-table/SecureBlockchainTable-support';
import { SalaryManagerApp } from './salary-manager-app/SalaryManagerApp';

export type SBTOpenMode = 'edit' | 'app';
export type SalaryManagerTabConfig = { sbtManager: SBTManager; mode: SBTOpenMode };

export function SecureBlockchainTableUi() {
  const [value, setValue] = React.useState(0);
  const [config, setConfig] = React.useState<SalaryManagerTabConfig>();

  const done = useCallback(() => {
    setConfig(undefined);
    setValue(0);
  }, []);
  useEffect(() => {
    if (config) {
      setValue(1);
    }
  }, [config]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const privateMessageStore = getPrivateMessageStore();
  if (!privateMessageStore) {
    return (
      <StatusMessageElement
        statusMessage={warningMessage(`No contract found for ${ContractName.SECURE_BLOCKCHAIN_TABLE}!`)}
      />
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Salary Manager List" />
          {!!config && <Tab label={`Salary Manager ${config.sbtManager.name}`} disabled={!config} />}
        </Tabs>
      </Box>
      <Paper sx={{ margin: '1em 0 1em 0' }}>
        {value === 0 && <SecureBlockchainTableListUi setConfig={setConfig} />}
        {value === 1 && <AppSwitch done={done} config={config} />}
      </Paper>
    </Box>
  );
}

const AppSwitch: FC<{ config?: SalaryManagerTabConfig; done: NotifyFun }> = ({ config, done }) => {
  if (!config) {
    return <StatusMessageElement statusMessage={infoMessage('No Salary Manager selected!')} />;
  }

  if (config.mode === 'edit') {
    return <SecureBlockchainTableEditorUi sbtManager={config.sbtManager} done={done} />;
  }

  return <SalaryManagerApp sbtManager={config.sbtManager} done={done} />;
};
