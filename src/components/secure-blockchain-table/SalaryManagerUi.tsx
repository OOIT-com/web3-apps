import * as React from 'react';
import { FC, useCallback, useEffect } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Paper } from '@mui/material';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { infoMessage, NotifyFun, warningMessage } from '../../types';
import { ContractName } from '../../contracts/contract-utils';
import { SecureBlockchainTableListUi } from './SecureBlockchainTableListUi';
import { SecureBlockchainTableEditorUi } from './SecureBlockchainTableEditorUi';
import { SBTManager } from '../../contracts/secure-blockchain-table/SecureBlockchainTable-support';
import { SalaryManagerApp } from './salary-manager-app/SalaryManagerApp';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import { AppTopTitle } from '../common/AppTopTitle';
import salaryManagerPng from '../images/salary-manager.png';

export type SBTOpenMode = 'edit' | 'app';
export type SalaryManagerTabConfig = { sbtManager: SBTManager; mode: SBTOpenMode };

export function SalaryManagerUi() {
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

  const privateMessageStore = null;
  if (!privateMessageStore) {
    return (
      <StatusMessageElement
        statusMessage={warningMessage(`No contract found for ${ContractName.SECURE_BLOCKCHAIN_TABLE}!`)}
      />
    );
  }

  return (
    <CollapsiblePanel
      collapsible={false}
      level={'top'}
      title={<AppTopTitle title={'Salary Manager'} avatar={salaryManagerPng} />}
      content={[
        <Tabs key={'tabs'} value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Salary Manager List" />
          {!!config && <Tab label={`Salary Manager ${config.sbtManager.name}`} disabled={!config} />}
        </Tabs>,
        <Paper key={'paper'} sx={{ margin: '1em 0 1em 0' }}>
          {value === 0 && <SecureBlockchainTableListUi setConfig={setConfig} />}
          {value === 1 && <AppSwitch done={done} config={config} />}
        </Paper>
      ]}
    ></CollapsiblePanel>
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
