import { useState } from 'react';
import { Button, Stack, Tooltip } from '@mui/material';
import { ConnectWithLocalstore } from './ConnectWithLocalstore';
import { ConnectWithMetamaskButton } from './ConnectWithMetamaskButton';
import { LoginFragment } from './LoginFragment';

export const Login: React.FC = () => {
  const [openConnectDirect, setOpenConnectDirect] = useState(false);

  return (
    <LoginFragment
      content={
        <Stack key={'login-buttons'}>
          <ConnectWithMetamaskButton key={'connect-with-metamask'} />
          <Tooltip key={'connect-with-localstore'} title={'Use Wallet from Browsers Local Storage.'}>
            <Button onClick={() => setOpenConnectDirect(true)}>Connect With LocalStorage</Button>
          </Tooltip>
          {openConnectDirect && (
            <ConnectWithLocalstore key={'connect-with-local-store'} done={() => setOpenConnectDirect(false)} />
          )}
        </Stack>
      }
    />
  );
};
