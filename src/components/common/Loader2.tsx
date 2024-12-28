import { Backdrop, Box, CircularProgress, Stack, Theme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useAppContext } from '../AppContextProvider';
import { DivBox } from './DivBox';

export default function Loader2() {
  const { loading } = useAppContext();
  const [start, setStart] = useState(false);
  const handleClose = () => {};

  useEffect(() => {
    setStart(false);
    const id = window.setTimeout(() => setStart(true), 300);
    return () => clearTimeout(id);
  }, [loading]);

  if (loading) {
    return (
      <Backdrop
        sx={(theme) => ({ background: '#11111199', color: '#fff', zIndex: theme.zIndex.drawer + 1000 })}
        open={true}
        onClick={handleClose}
      >
        {start && (
          <DivBox sx={(theme: Theme) => ({ background: 'black', padding: '2em', borderRadius: '0.4em' })}>
            <Stack spacing={2} direction={'row'}>
              <CircularProgress color={'primary'} />
              <Box sx={{ whiteSpace: 'nowrap', fontSize: '120%' }}>{loading}</Box>
            </Stack>
          </DivBox>
        )}
      </Backdrop>
    );
  }
  return <></>;
}
