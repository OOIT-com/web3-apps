import { Stack } from '@mui/material';
import { LoginFragment } from './LoginFragment';
import { DivBox } from '../common/DivBox';
import { LocalWalletLogin } from '../web3-local-wallet/LocalWalletLogin';

const title = process.env.REACT_APP_TITLE;
export const Login: React.FC = () => {
  return (
    <LoginFragment
      content={
        <Stack key={'login-buttons'} spacing={1}>
          {!!title && <DivBox sx={{ margin: '1em' }}>{title}</DivBox>}
          <LocalWalletLogin key={'local-wallet-login'} />
        </Stack>
      }
    />
  );
};
