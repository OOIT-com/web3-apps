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
import { Box, Stack, Tooltip } from '@mui/material';
import moment from 'moment';
import { EmptyItem, getKeyBlock, Item } from '../../contracts/key-block/KeyBlock-support';
import { orange } from '@mui/material/colors';
import { decryptContent, encryptContent } from '../../utils/metamask-util';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { decryptKeyBlockValue } from './key-block-utils';
import { useAppContext } from '../AppContextProvider';

type EditEntry = { value: string; enc: boolean; name: string };

export function KeyBlockEntry({
  open,
  item,
  done,
  update
}: Readonly<{
  item: Item;
  open: boolean;
  done: NotifyFun;
  update: (e: Item) => void;
}>) {
  const { wrap, web3Session, setLoading, dispatchSnackbarMessage } = useAppContext();
  const [item0, setItem0] = useState<Item>(EmptyItem);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | undefined>();
  const [dirty, setDirty] = useState(false);
  const [hidden, setHidden] = useState('');
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
              index: {item0.index} - inserted: {item0.inserted}
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
            variant="standard"
          />
          <TextField
            key={'secret-open'}
            disabled={entry.enc}
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
            variant="standard"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ height: '4em' }}>
          <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />
          <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
            <Button
              disabled={!entry.value || !entry.enc}
              onClick={async () => {
                try {
                  setLoading('Decryption processing...');
                  let s1: any = '';
                  if (mode === 'metamask') {
                    setStatusMessage(warningMessage('Please confirm/reject MetaMask dialog!'));
                  }
                  s1 = await decryptKeyBlockValue(entry.value, decryptFun);
                  setEntry((i) => ({ ...i, enc: false, value: s1.value }));
                  dispatchSnackbarMessage(infoMessage('Decryption done successfully'));
                  clearStatusMessageIn(2000);
                } catch (e) {
                  dispatchSnackbarMessage(errorMessage('Could not decrypt message!', (e as Error).message));
                  clearStatusMessageIn(5000);
                } finally {
                  setLoading('');
                }
              }}
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
              onClick={async () => {
                setLoading('Saving BlockEntry...');
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
                  const e: Item = {
                    index: item0.index,
                    name: entry.name,
                    secret: entry.value,
                    inserted: moment().format('YYYY-MM-DD HH:mm')
                  };
                  update(e);
                  done();
                } catch (e) {
                  setStatusMessage(errorMessage('Save not successful!', e));
                } finally {
                  setLoading('');
                }
                setDirty(false);
              }}
            >
              Save
            </Button>

            {hidden ? (
              <Tooltip key={'copy'} title={'Copy decrypted value to clipboard!'}>
                <span>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(hidden).then(() => {
                        setHidden('');
                        dispatchSnackbarMessage(infoMessage('Copyed to clipboard!'));
                      });
                    }}
                  >
                    Copy to clipboard!
                  </Button>
                </span>
              </Tooltip>
            ) : (
              <Tooltip key={'prepare-for-clipboard'} title={'Decryption for clipboard...!'}>
                <span>
                  <Button
                    disabled={!entry.value || !entry.enc}
                    onClick={async () =>
                      wrap('Processing', async () => {
                        setLoading('Decryption processing...');
                        setStatusMessage(warningMessage('Please confirm/reject MetaMask dialog!'));

                        const s0: any = await decryptContent(publicAddress, entry.value);
                        const value = s0.value;
                        setHidden(value);
                      })
                        .catch((e: Error) => {
                          dispatchSnackbarMessage(errorMessage('Could not decrypt message!', e.message));
                          clearStatusMessageIn(5000);
                        })
                        .finally(() => setStatusMessage(undefined))
                    }
                  >
                    Clipboard...
                  </Button>
                </span>
              </Tooltip>
            )}

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
