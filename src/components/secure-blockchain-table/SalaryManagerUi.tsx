import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Paper } from '@mui/material';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { infoMessage, isStatusMessage, StatusMessage } from '../../types';
import { SecureBlockchainTableListUi } from './sbt/SecureBlockchainTableListUi';
import { SBTManager } from '../../contracts/secure-blockchain-table/SecureBlockchainTable-support';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import { AppTopTitle } from '../common/AppTopTitle';
import salaryManagerPng from '../images/salary-manager.png';
import { ContractRegistry, getContractRegistry } from '../../contracts/contract-registry/ContractRegistry-support';
import { useAppContext } from '../AppContextProvider';
import { Web3NotInitialized } from '../common/Web3NotInitialized';
import defjson from './salary-manager-app/gen-table/sm-defs.json';
import { AppSwitch } from './AppSwitch';

export type SBTOpenMode = 'edit' | 'app';
export type SalaryManagerTabConfig = { sbtManager: SBTManager; mode: SBTOpenMode };

export function SalaryManagerUi() {
  const { wrap, web3Session } = useAppContext();
  const { publicAddress } = web3Session || {};
  const [value, setValue] = React.useState(0);
  const [config, setConfig] = React.useState<SalaryManagerTabConfig>();
  const [contractRegistry, setContractRegistry] = useState<ContractRegistry>();
  const [owner, setOwner] = useState('');
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();

  const done = useCallback(() => {
    setConfig(undefined);
    setValue(0);
  }, []);

  useEffect(() => {
    wrap('Reading Ownership...', async () => {
      if (contractRegistry) {
        const res = await contractRegistry.getOwner();
        if (isStatusMessage(res)) {
          setStatusMessage(res);
        } else {
          setOwner(res);
        }
      }
    });
  }, [contractRegistry, web3Session, wrap]);

  useEffect(() => {
    if (!contractRegistry) {
      setContractRegistry(getContractRegistry());
    }
  }, [contractRegistry]);

  useEffect(() => {
    if (config) {
      setValue(1);
    }
  }, [config]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  if (!web3Session) {
    return <Web3NotInitialized />;
  }

  if (!contractRegistry) {
    return <StatusMessageElement statusMessage={infoMessage(`No Contract Registry available!`)} />;
  }
  return (
    <CollapsiblePanel
      collapsible={false}
      level={'top'}
      title={<AppTopTitle title={'Salary Manager'} avatar={salaryManagerPng} />}
      content={[
        <div key={'json'}>{JSON.stringify(defjson)}</div>,
        <StatusMessageElement
          key={'status-message'}
          statusMessage={statusMessage}
          onClose={() => setStatusMessage(undefined)}
        />,
        <Tabs key={'tabs'} value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Salary Manager List" />
          {!!config && <Tab label={`Salary Manager ${config.sbtManager.name}`} disabled={!config} />}
        </Tabs>,
        <Paper key={'paper'} sx={{ margin: '1em 0 1em 0' }}>
          {value === 0 && (
            <SecureBlockchainTableListUi
              prefix={'SALARY_MANAGER_'}
              isOwner={publicAddress === owner}
              setConfig={setConfig}
            />
          )}
          {value === 1 && <AppSwitch done={done} config={config} />}
        </Paper>
      ]}
    ></CollapsiblePanel>
  );
}
