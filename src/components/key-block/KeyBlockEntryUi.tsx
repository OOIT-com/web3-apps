import * as React from 'react';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { errorMessage, infoMessage, isStatusMessage, NotifyFun, StatusMessage, warningMessage } from '../../types';
import { Box, IconButton, InputAdornment, Stack, Tooltip } from '@mui/material';
import moment from 'moment';
import { EmptyItem, getKeyBlock, SecretVaultEntry } from '../../contracts/key-block/KeyBlock-support';
import { orange } from '@mui/material/colors';
import { encryptContent } from '../../utils/metamask-util';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { decryptKeyBlockValue } from './key-block-utils';
import { useAppContext } from '../AppContextProvider';
import { Visibility, VisibilityOff } from '@mui/icons-material';

type EditEntry = { value: string; enc: boolean; name: string };

export function KeyBlockEntry({
  open,
  item,
  done,
  update
}: Readonly<{
  item: SecretVaultEntry;
  open: boolean;
  done: NotifyFun;
  update: (e: SecretVaultEntry) => void;
}>) {
  const { web3Session, dispatchSnackbarMessage, wrap } = useAppContext();
  const [item0, setItem0] = useState<SecretVaultEntry>(EmptyItem);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | undefined>();
  const [dirty, setDirty] = useState(false);
  const [entry, setEntry] = useState<EditEntry>({
    value: '',
    enc: false,
    name: ''
  });
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const clearStatusMessageIn = useCallback((ms: number) => setTimeout(() => setStatusMessage(undefined), ms), []);

  useEffect(() => setItem0(item), [item]);
  useEffect(() => {
    setEntry({ enc: !!item.secret, value: item.secret, name: item.name });
    setDirty(false);
    setStatusMessage(undefined);
  }, [item]);

  if (!web3Session) {
    return <></>;
  }

  const { publicAddress, decryptFun, publicKeyHolder, mode } = web3Session;

  const keyBlock = getKeyBlock();
  if (!keyBlock) {
    console.warn('KeyBlock not initialized');
    return <></>;
  }

  return (
    <Dialog open={open} onClose={done} fullWidth={true} maxWidth={'md'}>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={2}>
          <Box>Edit KeyBlock Item{dirty ? '*' : ''}</Box>
          <Box>{item0.index === -1 ? '' : `Inserted: ${item0.inserted}`}</Box>
          <Box sx={{ color: orange.A400 }}>{item0.index === -1 ? 'New' : `Index: ${item0.index}`}</Box>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={4}>
          <DialogContentText>You can edit change the name and the secret.</DialogContentText>
          {item0.inserted ? (
            <Box>
              Nr: {item0.index + 1} - Inserted at: {item0.inserted}
            </Box>
          ) : (
            <></>
          )}
          <TextField
            key={'name'}
            autoFocus
            margin="dense"
            value={entry.name || ''}
            label="Name"
            fullWidth
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setEntry((i) => ({ ...i, name: e.target.value }));
              setDirty(true);
            }}
            size={'small'}
          />
          <TextField
            key={'secret-open'}
            disabled={entry.enc}
            type={showPassword ? 'text' : 'password'}
            autoFocus
            margin="dense"
            label={entry.enc ? `Value (encrypted size:${entry.value.length})` : 'Value (plain text)'}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setEntry((i) => {
                return {
                  ...i,
                  value: e.target.value,
                  enc: false
                };
              });
              setDirty(true);
            }}
            value={entry.value}
            fullWidth
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
            size={'small'}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ height: '4em' }}>
          <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />
          <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
            <Button
              disabled={!entry.value || !entry.enc}
              onClick={() =>
                wrap('Decryption processing...', async () => {
                  try {
                    let s1: any = '';
                    if (mode === 'metamask') {
                      dispatchSnackbarMessage(warningMessage('Please confirm/reject MetaMask dialog!'));
                    }
                    s1 = await decryptKeyBlockValue(entry.value, decryptFun);
                    setEntry((i) => ({ ...i, enc: false, value: s1.value }));
                    dispatchSnackbarMessage(infoMessage('Decryption done successfully'));
                    clearStatusMessageIn(2000);
                  } catch (e) {
                    setStatusMessage(errorMessage('Could not decrypt message!', (e as Error).message));
                    clearStatusMessageIn(5000);
                  }
                })
              }
            >
              Decrypt
            </Button>
            <Button
              disabled={entry.enc || !entry.value}
              onClick={() => {
                if (publicKeyHolder) {
                  const s0 = encryptContent(publicKeyHolder.publicKey, {
                    value: entry.value,
                    nonce: 'n' + Math.random()
                  });
                  setEntry((i) => ({ ...i, enc: true, value: s0 }));
                  setStatusMessage(infoMessage('Encryption done successfully'));
                  clearStatusMessageIn(1000);
                } else {
                  setStatusMessage(errorMessage('No public key available! Can not encrypt!'));
                }
              }}
            >
              Encrypt
            </Button>
            <Button
              disabled={!(entry.enc && entry.value && dirty)}
              onClick={async () =>
                wrap('Saving Secret Vault Entry...', async () => {
                  setStatusMessage(infoMessage('Saving... Please confirm/reject MetaMask dialog!'));
                  try {
                    if (item0.index === -1) {
                      const res = await keyBlock.add(publicAddress, entry.name, entry.value);
                      if (isStatusMessage(res)) {
                        setStatusMessage(res);
                        return;
                      }
                    } else {
                      const res = await keyBlock.set(publicAddress, item0.index, entry.name, entry.value);
                      if (isStatusMessage(res)) {
                        setStatusMessage(res);
                        return;
                      }
                    }
                    const e: SecretVaultEntry = {
                      index: item0.index,
                      name: entry.name,
                      secret: entry.value,
                      inserted: moment().format('YYYY-MM-DD HH:mm')
                    };
                    update(e);
                    done();
                  } catch (e) {
                    setStatusMessage(errorMessage('Save not successful!', e));
                  }
                  setDirty(false);
                })
              }
            >
              Save
            </Button>
            <Tooltip key={'copy-to-clipboard'} title={'Copy decrypted value to clipboard!'}>
              <span>
                <Button
                  disabled={entry.enc}
                  onClick={() => wrap('Copy to Clipboard...', () => navigator.clipboard.writeText(entry.value))}
                >
                  Copy to clipboard!
                </Button>
              </span>
            </Tooltip>
            <Button
              onClick={() => {
                done();
              }}
            >
              Close
            </Button>
          </Stack>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
