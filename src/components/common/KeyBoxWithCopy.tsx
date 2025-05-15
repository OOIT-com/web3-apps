import { IconButton, Stack, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import * as React from 'react';
import { FC, useState } from 'react';
import { LDBox, PublicKeyBox } from './StyledBoxes';
import { displayKey } from '../../utils/enc-dec-utils';
import { useAppContext } from '../AppContextProvider';
import {infoMessage} from "../../utils/status-message";

const defaultSx = {
  fontSize: '80%',
  border: '1px solid gray',
  padding: '0.4em',
  borderRadius: '0.4em',
  cursor: 'pointer'
};
const standardSx = { fontSize: '80%', padding: '0.4em', borderRadius: '0.4em', cursor: 'pointer' };

export const AddressBoxWithCopy: FC<{
  value?: string;
  label?: string;
  variant?: 'standard' | 'outlined';
  reduced?: boolean;
}> = ({ value = '-', label = '', variant = 'outlined', reduced = true }) => {
  const { dispatchSnackbarMessage } = useAppContext();
  const [reduced0, setReduced0] = useState<boolean>(reduced);

  let content = value;
  if (reduced0) {
    content = displayKey(value);
  }

  return (
    <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={0.6}>
      <Stack
        justifyContent="flex-start"
        alignItems="flex-start"
        spacing={0.6}
        sx={variant === 'standard' ? standardSx : defaultSx}
        onClick={() => setReduced0((b) => !b)}
      >
        {label && <LDBox sx={{ fontWeight: 'bolder' }}>{label}</LDBox>}
        <PublicKeyBox>{content}</PublicKeyBox>
      </Stack>
      <Tooltip title={'Copy Address to Clipboard.'}>
        <IconButton
          sx={{ display: !value ? 'none' : undefined }}
          aria-label="copy control to clipboard"
          onClick={async () => {
            await navigator.clipboard.writeText(value).catch(console.error);
            dispatchSnackbarMessage(infoMessage(`Value ${displayKey(value)} copied to clipboard!`));
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
