import * as React from 'react';
import { ChangeEvent, FC, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { NotifyFun } from '../../types';
import { Stack } from '@mui/material';
import { KeyBlock } from '../../contracts/key-block/KeyBlock-support';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { useAppContext } from '../AppContextProvider';
import { SelectUi } from '../../ui-factory/widgets/SelectUi';
import FileSaver from 'file-saver';
import zipcelx, { ZipCelXCell, ZipCelXDataSet } from 'zipcelx';
import { decryptKeyBlockValue2 } from './secret-vault-utils';
import { isStatusMessage, StatusMessage } from '../../utils/status-message';

type DownloadType = 'encrypted' | 'decrypted';
export const SecretVaultDownloadDialog: FC<{
  keyBlock: KeyBlock;
  open: boolean;
  done: NotifyFun;
}> = ({ keyBlock, open, done }) => {
  const { web3Session, wrap } = useAppContext();
  const [statusMessage, setStatusMessage] = useState<StatusMessage | undefined>();
  const [downloadType, setDownloadType] = useState<DownloadType>('encrypted');
  const [downloadFilename, setDownloadFilename] = useState('secret-vault-download.json');

  if (!web3Session) {
    return <></>;
  }

  const { publicAddress } = web3Session;

  return (
    <Dialog open={open} onClose={done} fullWidth={true} maxWidth={'md'}>
      <DialogTitle>Secret Vault Download</DialogTitle>
      <DialogContent>
        <Stack spacing={4}>
          <DialogContentText>Download your secrets</DialogContentText>
          <SelectUi
            def={{
              name: 'download-type',
              uiTypeOptions: {
                selectList: [
                  { value: 'encrypted', label: 'Encrypterd' },
                  {
                    value: 'decrypted',
                    label: 'Decrypted'
                  }
                ]
              }
            }}
            value={downloadType}
            action={(value) => setDownloadType(value['download-type'].toString() as DownloadType)}
          />
          <TextField
            key={'name'}
            autoFocus
            margin="dense"
            value={downloadFilename}
            label="Name"
            fullWidth
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setDownloadFilename(e.target.value);
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
              key={'download'}
              disabled={!downloadFilename}
              onClick={() =>
                wrap('Download processing...', async () => {
                  console.debug('download...');
                  const entries = await wrap('Loading Secret Vault Entries...', () =>
                    keyBlock.getAllEntries(publicAddress)
                  );
                  if (isStatusMessage(entries)) {
                    setStatusMessage(entries);
                  } else {
                    const dataSet: ZipCelXDataSet = [];

                    for (const { index, name, secret, inserted } of entries) {
                      let secretValue: string | undefined = secret;
                      if (downloadType === 'decrypted') {
                        secretValue = await decryptKeyBlockValue2(web3Session, secret);
                        if (secretValue === undefined) {
                          secretValue = 'Decryption failed!';
                        }
                      } else {
                        secretValue = secret;
                      }
                      const row: ZipCelXCell[] = [
                        { value: index, type: 'number' },
                        {
                          value: name,
                          type: 'string'
                        },
                        { value: secretValue, type: 'string' },
                        { value: inserted, type: 'string' }
                      ];
                      dataSet.push(row);
                    }

                    try {
                      const blob = await zipcelx({
                        filename: downloadFilename,
                        sheet: { data: dataSet }
                      });
                      if (blob) {
                        FileSaver.saveAs(blob, `${downloadFilename}.xlsx`, { autoBom: false });
                      }
                    } catch (e) {
                      console.error(e);
                    }
                  }
                })
              }
            >
              Download
            </Button>
            <Button key={'close'} onClick={done}>
              Close
            </Button>
          </Stack>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
