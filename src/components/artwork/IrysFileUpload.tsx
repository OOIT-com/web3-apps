import * as React from 'react';
import { useEffect, useState } from 'react';
import { isStatusMessage, StatusMessage } from '../../types';
import { Box, Stack } from '@mui/material';
import Button from '@mui/material/Button';
import { FileUploader } from 'react-drag-drop-files';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { LDBox } from '../common/StyledBoxes';
import { createSha256Hash } from '../../utils/crypto-util';
import { resolveAsStatusMessage } from '../../utils/status-message-utils';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { IrysAccess } from '../../utils/IrysAccess';
import { useAppContext } from '../AppContextProvider';
import { DownloadLinkWithCopy } from '../common/DownloadLinkWithCopy';

const LINK_URL = 'https://gateway.irys.xyz';

export function IrysFileUpload({ irysAccess }: Readonly<{ irysAccess: IrysAccess }>) {
  const { wrap, web3Session, dispatchSnackbarMessage } = useAppContext();
  const { publicAddress } = web3Session || {};

  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [providedFile, setProvidedFile] = useState<File>();
  const [contentHash, setContentHash] = useState('');
  const [uploadResponse, setUploadResponse] = useState<any>();

  useEffect(() => {
    if (providedFile && !contentHash) {
      wrap('Create SHA-256 Hash from provided file!', () => createSha256Hash(providedFile)).then((res) => {
        if (isStatusMessage(res)) {
          dispatchSnackbarMessage(res);
        } else {
          setContentHash(res);
        }
      });
    }
  }, [dispatchSnackbarMessage, wrap, contentHash, providedFile]);

  const downloadLink = `${LINK_URL}/${uploadResponse?.id}/?item=${providedFile?.name}`;

  return (
    <Stack spacing={2}>
      <LDBox sx={{ fontSize: '1.6em', margin: '1em 0 0.4em 0' }}>Upload your Artwork to the Arweave Blockchain</LDBox>

      <Stack key={'Step-1'} spacing={3} sx={{ border: 'solid 2px gray', borderRadius: '' }} p={2}>
        <Stack key={'toolbar'} direction={'row'} justifyContent="space-between" alignItems="baseline">
          <LDBox sx={{ fontSize: '1.3em', margin: '1em 0 0.4em 0' }}>Provide File (Artwork)</LDBox>
          <Button
            disabled={!providedFile}
            onClick={() => {
              setStatusMessage(undefined);
              setProvidedFile(undefined);
              setContentHash('');
              setUploadResponse(undefined);
            }}
          >
            Clear
          </Button>
        </Stack>
        <Stack key={'upload-file-control'} direction={'row'}>
          {!providedFile ? (
            <FileUploader
              handleChange={(file: File) => {
                setProvidedFile(file);
              }}
              name="file"
            />
          ) : (
            <Stack spacing={1}>
              <Stack direction={'row'} spacing={1}>
                <CheckCircleIcon sx={{ color: 'green' }} />
                <span>
                  <b>File Name:</b> {providedFile?.name}
                </span>
              </Stack>
              <Stack direction={'row'} spacing={1}>
                <CheckCircleIcon sx={{ color: 'green' }} />
                <span>
                  <b>SHA 256 Hash:</b> {contentHash}
                </span>
              </Stack>
            </Stack>
          )}
        </Stack>
        {providedFile && (
          <Stack key={'toolbar-upload'} direction={'row'} justifyContent="space-between" alignItems="baseline">
            <Button
              variant={'contained'}
              key={'irys-upload'}
              disabled={!providedFile || !publicAddress}
              onClick={async () => {
                if (providedFile && publicAddress && contentHash) {
                  const res = await wrap('Irys (Arweave) Upload processing...', async () => {
                    try {
                      const res = await irysAccess.upload(Buffer.from(await providedFile.arrayBuffer()), [
                        {
                          name: 'contentHash',
                          value: contentHash
                        }
                      ]);
                      if (isStatusMessage(res)) {
                        setStatusMessage(res);
                      } else {
                        setUploadResponse(res);
                      }
                    } catch (e) {
                      return resolveAsStatusMessage('Irys Upload failed', e);
                    }
                  });
                  if (isStatusMessage(res)) {
                    setStatusMessage(res);
                  }
                }
              }}
            >
              {`Upload ${providedFile?.name ?? '-???-'} to Arweave`}
            </Button>
          </Stack>
        )}
        {uploadResponse && (
          <>
            <Box sx={{ fontSize: '80%' }}>
              <pre>{JSON.stringify(uploadResponse, null, ' ')}</pre>
              <Box>{downloadLink}</Box>{' '}
            </Box>
            <Box>
              <DownloadLinkWithCopy
                variant={'outlined'}
                downloadLink={downloadLink}
                label={`Download ${providedFile?.name}`}
              ></DownloadLinkWithCopy>
            </Box>
          </>
        )}
        <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />
      </Stack>
    </Stack>
  );
}
