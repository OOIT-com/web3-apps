import { Box, Stack } from '@mui/material';
import * as React from 'react';
import { FC } from 'react';
import { OutMessage } from './private-message-store2-types';

export const OutMessageDisplay: FC<{
  message: OutMessage;
  text: string;
}> = ({ message, text }) => {
  const { index } = message;

  return (
    <Stack>
      <Box key={'index'} sx={{ fontWeight: 'bold' }}>
        {index}
      </Box>
      <Box key={'subject'} sx={{ fontWeight: 'bold' }}>
        subj: {message.subjectOutBox}
      </Box>
      <Box key={'text'}>{text}</Box>
    </Stack>
  );
};
