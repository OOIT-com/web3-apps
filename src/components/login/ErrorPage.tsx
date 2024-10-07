import { useNavigate, useRouteError } from 'react-router-dom';
import { Box, Stack } from '@mui/material';
import Button from '@mui/material/Button';
import { LoginFragment } from './LoginFragment';
import { LDBox } from '../common/StyledBoxes';

export function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();
  let errorString = '';

  if (typeof error === 'object') {
    errorString = JSON.stringify(error);
  } else if (error === 'string' || error === 'number') {
    errorString = '' + error;
  }
  errorString = !errorString || errorString === 'null' ? '' : errorString;
  return (
    <LoginFragment
      content={
        <Stack
          spacing={2}
          sx={{
            justifyContent: 'center',
            alignItems: 'center',
            margin: '1em',
            padding: '2em'
          }}
        >
          <Box key={'title'} sx={{ color: 'red', fontSize: '200%' }}>
            Oops, something went wrong!
          </Box>
          <LDBox key={'error-info'} sx={{ maxWidth: '50%' }}>
            {errorString}
          </LDBox>
          <Button
            key={'back-button'}
            variant={'contained'}
            color={'error'}
            size={'large'}
            onClick={() => navigate('/')}
          >
            Back
          </Button>
        </Stack>
      }
    />
  );
}
