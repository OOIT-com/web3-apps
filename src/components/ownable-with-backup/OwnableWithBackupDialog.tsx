import { NotifyFun } from '../../types';
import Dialog from '@mui/material/Dialog';
import { OwnableWithBackupUi } from './OwnableWithBackupUi';
import { Container, Stack } from '@mui/material';
import Button from '@mui/material/Button';

export function OwnableWithBackupDialog({
  contractAddress,
  done
}: Readonly<{
  contractAddress: string;
  done: NotifyFun;
}>) {
  return (
    <Dialog open={true} onClose={() => done()} maxWidth={'lg'} fullWidth={true}>
      <Container sx={{ margin: '2em 0' }}>
        <OwnableWithBackupUi contractAddress={contractAddress} />
        <Stack direction={'row'} justifyContent={'end'}>
          <Button onClick={() => done()}>Close</Button>
        </Stack>
      </Container>
    </Dialog>
  );
}
