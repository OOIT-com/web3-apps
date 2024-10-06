import { Avatar, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { FC } from 'react';

export type AppTopTitleProps = { title: string; avatar: string };
export const AppTopTitle: FC<AppTopTitleProps> = ({ title, avatar }) => (
  <Stack direction={'row'} spacing={2}>
    <Avatar sx={{ fontSize: 'inherit' }} src={avatar} variant={'square'} />
    <Typography sx={{ fontSize: 'inherit', whiteSpace: 'nowrap' }}>{title}</Typography>
  </Stack>
);
