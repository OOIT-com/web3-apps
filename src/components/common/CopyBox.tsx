import * as React from 'react';
import { FC } from 'react';
import { Box, BoxProps, IconButton, Stack, Theme, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { SystemStyleObject } from '@mui/system/styleFunctionSx/styleFunctionSx';

export const CopyBox: FC<BoxProps & { copyValue: string; copyBoxSx?: SystemStyleObject<Theme> }> = (props) => {
  const copyValue = props.copyValue;
  const copyBoxSx = props.copyBoxSx;

  let sx: SystemStyleObject<Theme> = {
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  };
  if (typeof copyBoxSx === 'object') {
    sx = { ...sx, ...copyBoxSx };
  }
  return (
    <Stack direction="row" spacing={2} sx={sx}>
      <Box component="div" {...props} />
      <Tooltip title={'Copy value to clipboard'}>
        <IconButton
          aria-label="copy control to clipboard"
          onClick={async () => {
            await navigator.clipboard.writeText(copyValue).catch(console.error);
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
