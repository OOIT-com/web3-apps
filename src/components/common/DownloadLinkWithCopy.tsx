import { Button, IconButton, Stack, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import * as React from 'react';
import { FC } from 'react';

export const DownloadLinkWithCopy: FC<{
  downloadLink: string;
  label: string;
  variant?: 'text' | 'outlined' | 'contained';
}> = ({ downloadLink = '-', label = '', variant = 'outlined' }) => {
  return (
    <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={0.6}>
      <Button variant={variant as any} href={downloadLink}>
        {label}
      </Button>
      <Tooltip title={`Copy ${downloadLink} to Clipboard.`}>
        <IconButton
          onClick={async () => {
            await navigator.clipboard.writeText(downloadLink).catch(console.error);
          }}
          edge="end"
        >
          <ContentCopyIcon
            sx={{
              fontSize: '70%'
            }}
          />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};
