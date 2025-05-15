import * as React from 'react';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { NotifyFun } from '../../types';
import { Box, Stack, Tooltip } from '@mui/material';
import moment from 'moment';
import { EmptyItem, getKeyBlock, SecretVaultEntry } from '../../contracts/key-block/KeyBlock-support';
import { orange } from '@mui/material/colors';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { decryptKeyBlockValue2, encryptKeyBlockValue2 } from './secret-vault-utils';
import { useAppContext } from '../AppContextProvider';
import { PasswordTextField } from '../common/PasswordTextField';
import { errorMessage, infoMessage, isStatusMessage, StatusMessage } from '../../utils/status-message';

type EditEntry = { value: string; enc: boolean; name: string };

export function SecretVaultEntryUi({
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

  const { publicAddress } = web3Session;

  const keyBlock = getKeyBlock();
  if (!keyBlock) {
    console.warn('Secret Vault not initialized');
    return <></>;
  }

  return (
    <Dialog open={open} onClose={done} fullWidth={true} maxWidth={'md'}>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={2}>
          <Box key={'p1'}>Edit Secret Entry{dirty ? '*' : ''}</Box>
          <Box key={'p2'}>{item0.index === -1 ? '' : `Inserted: ${item0.inserted}`}</Box>
          <Box key={'p3'} sx={{ color: orange.A400 }}>
            {item0.index === -1 ? 'New' : `Index: ${item0.index}`}
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={4}>
          <DialogContentText>Edit name and secret.</DialogContentText>
          {item0.inserted ? (
            <Box>
              Nr: {item0.index + 1} - Inserted at: {item0.inserted}
            </Box>
          ) : (
            <></>
          )}
          <TextField
            key={'name'}
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

          <PasswordTextField
            key={'secret-open'}
            disabled={entry.enc}
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
            size={'small'}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Stack
          key={'outer-stack'}
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
          sx={{ height: '4em' }}
        >
          <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />
          <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
            <Button
              key={'decrypt'}
              disabled={!entry.value || !entry.enc}
              onClick={() =>
                wrap('Decryption processing...', async () => {
                  try {
                    let s1: any = '';
                    s1 = await decryptKeyBlockValue2(web3Session, entry.value);
                    setEntry((i) => ({ ...i, enc: false, value: s1 }));
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
              key={'encrypt'}
              disabled={entry.enc || !entry.value}
              onClick={async () => {
                setStatusMessage(undefined);
                const s0 = await encryptKeyBlockValue2(web3Session, entry.value);
                if (!s0) {
                  setStatusMessage(errorMessage('Could not encrypt message!'));
                  return;
                }
                setEntry((i) => ({ ...i, enc: true, value: s0 }));
                setStatusMessage(infoMessage('Encryption done successfully'));
                clearStatusMessageIn(1000);
              }}
            >
              Encrypt
            </Button>
            <Button
              key={'save'}
              disabled={!(entry.enc && entry.value && dirty)}
              onClick={async () =>
                wrap('Saving Secret Vault Entry...', async () => {
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
