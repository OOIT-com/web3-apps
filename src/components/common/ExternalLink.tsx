import * as React from 'react';
import { FC } from 'react';
import Button from '@mui/material/Button';
import FileSaver from 'file-saver';

export const ExternalLink: FC<{ url: string; filename?: string }> = ({ url, filename }) => (
  <Button
    variant={'text'}
    key={url}
    onClick={() => {
      if (filename) {
        FileSaver.saveAs(url, filename);
      } else {
        window.open(url, undefined, 'noopener,noreferrer');
      }
    }}
  >
    {url}
  </Button>
);
