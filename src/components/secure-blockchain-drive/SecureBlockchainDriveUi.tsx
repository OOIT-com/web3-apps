import * as React from 'react';
import { useCallback, useState } from 'react';
import { Box, Paper } from '@mui/material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { useAppContext } from '../AppContextProvider';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import { Web3NotInitialized } from '../common/Web3NotInitialized';
import { AppTopTitle } from '../common/AppTopTitle';
import artworkPng from '../images/artwork.png';
import help from './SecureBlockchainDrive.md';
import { StatusMessage } from '../../utils/status-message';
import { ShamirSecretSharingUi } from './ShamirSecretSharingUi';

export const SecureBlockchainDriveUi = () => {
  const { web3Session } = useAppContext();
  const { web3, publicAddress } = web3Session || {};

  const [statusMessage, setStatusMessage] = useState<StatusMessage>();

  const [tabIndex, setTabIndex] = React.useState(0);
  const handleChange = useCallback((_event: React.SyntheticEvent, newTabIndex: number) => {
    setTabIndex(newTabIndex);
  }, []);

  if (!publicAddress || !web3) {
    return <Web3NotInitialized />;
  }

  return (
    <CollapsiblePanel
      help={help}
      level={'top'}
      title={<AppTopTitle title={'Secure Blockchain Drive'} avatar={artworkPng} />}
      collapsible={false}
    >
      <Box key={'irys-content'} sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <StatusMessageElement key={'statusMessage'} statusMessage={statusMessage} />
          <Tabs value={tabIndex} onChange={handleChange}>
            <Tab label="Shamir Secret Shareing Page" />
          </Tabs>
        </Box>
        <Paper sx={{ margin: '1em 0 1em 0' }}>{tabIndex === 0 && <ShamirSecretSharingUi />}</Paper>
      </Box>
    </CollapsiblePanel>
  );
};
