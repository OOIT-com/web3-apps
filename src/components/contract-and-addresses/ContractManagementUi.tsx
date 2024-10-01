import * as React from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Paper } from '@mui/material';
import { ContractRegistryUi } from '../contract-registry/ContractRegistryUi';
import { PlanDeployerUi } from '../tools/PlanDeployerUi';
import { ContractVerifierUi } from '../contract-registry/ContractVerfierUi';

export function ContractManagementUi() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Contract Registry" />
          <Tab label="Contract Deployments" />
          <Tab label="Contract Verifiers" />
        </Tabs>
      </Box>
      <Paper sx={{ margin: '1em 0 1em 0' }}>
        {value === 0 && <ContractRegistryUi />}
        {value === 1 && <PlanDeployerUi />}
        {value === 2 && <ContractVerifierUi />}
      </Paper>
    </Box>
  );
}
