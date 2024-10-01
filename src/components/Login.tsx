import { useState } from 'react';
import { Box, Button, Stack, Tooltip } from '@mui/material';

import logo from '../images/keyblock200.png';
import { ConnectWithLocalstore } from './ConnectWithLocalstore';
import { ConnectWithMetamaskButton } from './ConnectWithMetamaskButton';

const Login: React.FC = () => {
  const [openConnectDirect, setOpenConnectDirect] = useState(false);

  return (
    <Stack direction="column" justifyContent="center" alignItems="center" spacing={2} sx={{ marginTop: '2em' }}>
      <Box sx={{ padding: '2em', margin: '2em', boxShadow: '2px 2px 10px lightgrey' }}>
        <img src={logo} alt={'logo'} />
      </Box>
      <ConnectWithMetamaskButton key={'connect-with-metamask'} />
      <Tooltip key={'connect-with-localstore'} title={'Use Wallet from Browsers Local Storage.'}>
        <Button onClick={() => setOpenConnectDirect(true)}>Connect With LocalStorage</Button>
      </Tooltip>
      {openConnectDirect && <ConnectWithLocalstore done={() => setOpenConnectDirect(false)} />}
    </Stack>
  );
};

export default Login;
