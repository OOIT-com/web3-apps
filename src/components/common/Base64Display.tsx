import { IconButton, Stack, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import * as React from 'react';
import { useState } from 'react';
import { LDBox, LDBoxCode } from './StyledBoxes';
import { display64 } from '../../utils/misc-util';

export function Base64Display({
  value,
  label = '',
  max = 32
}: Readonly<{
  value: string;
  label?: string;
  max?: number;
}>) {
  const [reduced, setReduced] = useState(!!max);

  return (
    <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={0.6} sx={{ fontSize: '80%' }}>
      <Stack
        justifyContent="flex-start"
        alignItems="flex-start"
        spacing={0.6}
        sx={{ border: '1px solid gray', padding: '0.4em', borderRadius: '0.4em', cursor: 'pointer' }}
        onClick={() => setReduced((b) => !b)}
      >
        <LDBox sx={{ fontStyle: 'italic' }}>{label}</LDBox>
        <LDBoxCode>{display64(value, reduced ? max : 0)}</LDBoxCode>
      </Stack>
      <Tooltip title={'Copy to Clipboard!'}>
        <IconButton
          sx={{ display: !value ? 'none' : undefined }}
          aria-label="copy value to clipboard"
          onClick={() => {
            navigator.clipboard.writeText(value).catch(console.error);
          }}
          edge="end"
        >
          <ContentCopyIcon></ContentCopyIcon>
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
