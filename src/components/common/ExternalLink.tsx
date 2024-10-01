import * as React from 'react';
import { FC } from 'react';
import Button from '@mui/material/Button';

export const ExternalLink: FC<{ url: string }> = ({ url }) => (
  <Button variant={'text'} key={url} onClick={() => window.open(url)}>
    {url}
  </Button>
);
