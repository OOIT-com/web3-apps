import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Paper } from '@mui/material';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { SecureBlockchainTableListUi } from './sbt/SecureBlockchainTableListUi';
import { SBTManager } from '../../contracts/secure-blockchain-table/SecureBlockchainTable-support';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import { AppTopTitle } from '../common/AppTopTitle';
import salaryManagerPng from '../images/salary-manager.png';
import { ContractRegistry, getContractRegistry } from '../../contracts/contract-registry/ContractRegistry-support';
import { useAppContext } from '../AppContextProvider';
import { Web3NotInitialized } from '../common/Web3NotInitialized';
import { SecureBlockchainTableSwitch } from './SecureBlockchainTableSwitch';
import { infoMessage, isStatusMessage, StatusMessage } from '../../utils/status-message';

export type SBTOpenMode = 'edit' | 'app';
export type SBTManagerData = { sbtManager: SBTManager; mode: SBTOpenMode };

export function SecureBlockchainTableUi() {
  const { wrap, web3Session } = useAppContext();
  const { publicAddress } = web3Session || {};
  const [tabIndex, setTabIndex] = React.useState(0);
  const [currentSBT, setCurrentSBT] = React.useState<SBTManagerData>();
  const [contractRegistry, setContractRegistry] = useState<ContractRegistry>();
  const [owner, setOwner] = useState('');
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();

  const done = useCallback(() => {
    setCurrentSBT(undefined);
    setTabIndex(0);
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
    if (currentSBT) {
      setTabIndex(1);
    }
  }, [currentSBT]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
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
        <StatusMessageElement
          key={'status-message'}
          statusMessage={statusMessage}
          onClose={() => setStatusMessage(undefined)}
        />,
        <Tabs key={'tabs'} value={tabIndex} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Salary Manager List" />
          {!!currentSBT && <Tab label={`SBT Manager ${currentSBT.sbtManager.name}`} disabled={!currentSBT} />}
        </Tabs>,
        <Paper key={'paper'} sx={{ margin: '1em 0 1em 0' }}>
          {tabIndex === 0 && (
            <SecureBlockchainTableListUi
              prefix={'SALARY_MANAGER_'}
              isOwner={publicAddress === owner}
              setCurrentSBT={setCurrentSBT}
            />
          )}
          {tabIndex === 1 && <SecureBlockchainTableSwitch done={done} sbtManagerData={currentSBT} />}
        </Paper>
      ]}
    ></CollapsiblePanel>
  );
}
