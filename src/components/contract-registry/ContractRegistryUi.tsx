import * as React from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Paper } from '@mui/material';
import { ContractRegistryListUi } from './ContractRegistryListUi';
import { planDeployerTitle, PlanDeployerUi } from './PlanDeployerUi';
import { ContractVerifierUi } from './ContractVerfierUi';

export function ContractRegistryUi() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="List of Registered Contracts" />
          <Tab label={planDeployerTitle} />
          <Tab label="Contract Verifiers" />
        </Tabs>
      </Box>
      <Paper sx={{ margin: '1em 0 1em 0' }}>
        {value === 0 && <ContractRegistryListUi />}
        {value === 1 && <PlanDeployerUi />}
        {value === 2 && <ContractVerifierUi />}
      </Paper>
    </Box>
  );
}
