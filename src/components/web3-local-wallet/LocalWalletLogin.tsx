import { FC, useState } from 'react';
import { Button, Tooltip } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import { LocalWalletConnectDialog } from './LocalWalletConnectDialog';
import { LocalWalletPasswordDialog } from './LocalWalletPasswordDialog';

export const LocalWalletLogin: FC = () => {
  const [walletPassword, setWalletPassword] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  if (!openDialog) {
    return (
      <Tooltip key={'connect-with-local-store'} title={'Use Local Wallet (local storage)...'}>
        <Button startIcon={<LinkIcon />} variant={'outlined'} onClick={() => setOpenDialog(true)}>
          Connect with Local Wallet
        </Button>
      </Tooltip>
    );
  } else if (walletPassword) {
    return <LocalWalletConnectDialog key={'connect-with-local-store'} walletPassword={walletPassword} />;
  } else {
    return <LocalWalletPasswordDialog returnWalletPassword={setWalletPassword} />;
  }
};
