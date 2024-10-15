import * as React from 'react';
import { useState } from 'react';
import { Box, Container } from '@mui/material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { SeedPhrase2Keys } from './SeedPhrase2Keys';
import { ContractDeployment } from './ContractDeployment';
import { EventFinder } from './EventFinder';
import { EncryptionAndDecryption } from './EncryptionAndDecryption';
import { EncryptionWithUserAddress } from './EncryptionWithUserAddress';
import { AppTopTitle } from '../common/AppTopTitle';
import toolsImg from '../images/tools.png';
import { CollapsiblePanel } from '../common/CollapsiblePanel';

const isDev = process.env.REACT_APP_ENV === 'DEV';

export function ToolsUi() {
  const [tabValue, setTabValue] = useState(0);

  return (
    <CollapsiblePanel
      level={'top'}
      collapsible={false}
      collapsed={false}
      title={<AppTopTitle title={'Tools'} avatar={toolsImg} />}
      content={[
        <Box key={'tools'} sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={(event: React.SyntheticEvent, newValue: number) => {
                setTabValue(newValue);
              }}
            >
              <Tab key={'phrase-to-keys'} label="Wallet, Seed Phrase and Keys" />
              <Tab key={'1'} label="Encryption/Decryption" />
              <Tab key={'2'} label="Encryption for User" />
              {isDev && <Tab key={'3'} label="Contract Deployment" />}
              {isDev && <Tab key={'4'} label="Event Finder" />}
            </Tabs>
          </Box>
          <Container sx={{ marginTop: '1em' }}>
            <Box key={0} sx={{ display: tabValue === 0 ? 'block' : 'none' }}>
              <SeedPhrase2Keys />
            </Box>
            <Box key={1} sx={{ display: tabValue === 1 ? 'block' : 'none' }}>
              <EncryptionAndDecryption />
            </Box>
            <Box key={2} sx={{ display: tabValue === 2 ? 'block' : 'none' }}>
              <EncryptionWithUserAddress />
            </Box>
            {isDev && (
              <Box key={3} sx={{ display: tabValue === 3 ? 'block' : 'none' }}>
                <ContractDeployment />
              </Box>
            )}
            {isDev && (
              <Box key={4} sx={{ display: tabValue === 4 ? 'block' : 'none' }}>
                <EventFinder />
              </Box>
            )}
          </Container>
        </Box>
      ]}
    />
  );
}
