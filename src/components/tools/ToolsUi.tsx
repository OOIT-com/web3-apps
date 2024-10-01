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

export function ToolsUi() {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box sx={{ width: '100%' }}>
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
          <Tab key={'3'} label="Contract Deployment" />
          <Tab key={'4'} label="Event Finder" />
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
        <Box key={3} sx={{ display: tabValue === 3 ? 'block' : 'none' }}>
          <ContractDeployment />
        </Box>
        <Box key={4} sx={{ display: tabValue === 4 ? 'block' : 'none' }}>
          <EventFinder />
        </Box>
      </Container>
    </Box>
  );
}
