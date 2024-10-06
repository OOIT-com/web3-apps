import * as React from 'react';
import { useState } from 'react';
import { Stack } from '@mui/material';
import Button from '@mui/material/Button';
import { FileUploader } from 'react-drag-drop-files';
import { decryptedFilename, decryptFile } from './CreateArtworkUi';
import { LDBox } from '../common/StyledBoxes';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { file2string } from '../../utils/misc-util';
import { createSha256Hash } from '../../utils/crypto-util';
import { errorMessage, infoMessage, isStatusMessage, StatusMessage } from '../../types';
import { secretKey2BoxKeyPair } from '../../utils/nacl-util';
import { saveAs } from 'file-saver';

import { StatusMessageElement } from '../common/StatusMessageElement';
import { useAppContext } from '../AppContextProvider';

type Metadata = {
  secretKey: string;
  contentHash: string;
  filename: string;
};

export function DecryptFileUi() {
  const { wrap, dispatchSnackbarMessage } = useAppContext();
  const [encryptedFile, setEncryptedFile] = useState<File>();
  const [encryptedContentHash, setEncryptedContentHash] = useState('');

  const [metadataFile, setMetadataFile] = useState<File>();
  const [metadata, setMetadata] = useState<Metadata>();

  const [checkMessage, setCheckMessage] = useState<StatusMessage>();

  return (
    <Stack spacing={2}>
      <LDBox sx={{ fontSize: '1.6em', margin: '1em 0 0.4em 0' }}>Decrypt and Download</LDBox>

      <Stack key={'Step-1'} spacing={3} sx={{ border: 'solid 2px gray', borderRadius: '' }} p={2}>
        <Stack key={'toolbar'} direction={'row'} justifyContent="space-between" alignItems="baseline">
          <LDBox sx={{ fontSize: '1.3em', margin: '1em 0 0.4em 0' }}>Step 1: Provide File to Decrypt</LDBox>
          <Button
            disabled={!encryptedFile}
            onClick={() => {
              setEncryptedFile(undefined);
              setEncryptedContentHash('');
              setMetadataFile(undefined);
              setCheckMessage(undefined);
            }}
          >
            Clear
          </Button>
        </Stack>

        <Stack key={'upload-encrypted-file'} direction={'row'}>
          {!encryptedFile ? (
            <FileUploader
              handleChange={async (file: File) => {
                setEncryptedFile(file);
                const res = await wrap('Create SHA-256 Hash from encrypted file!', () => createSha256Hash(file));
                if (isStatusMessage(res)) {
                  dispatchSnackbarMessage(res);
                } else {
                  setEncryptedContentHash(res);
                }
              }}
              name="file"
            />
          ) : (
            <Stack spacing={1}>
              <Stack direction={'row'} spacing={1}>
                <CheckCircleIcon sx={{ color: 'green' }} />
                <span>
                  <b>Name of Encrypted File:</b> {encryptedFile?.name}
                </span>
              </Stack>
              <Stack direction={'row'} spacing={1}>
                <CheckCircleIcon sx={{ color: 'green' }} />
                <span>
                  <b>SHA 256 Hash:</b> {encryptedContentHash}
                </span>
              </Stack>
            </Stack>
          )}
        </Stack>
      </Stack>

      <Stack key={'Step-2'} spacing={3} sx={{ border: 'solid 2px gray', borderRadius: '' }} p={2}>
        <Stack key={'toolbar'} direction={'row'} justifyContent="space-between" alignItems="baseline">
          <LDBox sx={{ fontSize: '1.3em', margin: '1em 0 0.4em 0' }}>Step 2: Provide Metadata File</LDBox>{' '}
          <Button
            disabled={!metadataFile}
            onClick={() => {
              setMetadataFile(undefined);
              setMetadata(undefined);
              setCheckMessage(undefined);
            }}
          >
            Clear
          </Button>
        </Stack>
        <Stack key={'metadata-file'} direction={'row'}>
          {!metadata ? (
            <FileUploader
              handleChange={async (file: File) => {
                setMetadataFile(file);
                const str = await file2string(file);
                try {
                  const obj = JSON.parse(str);
                  const secretKey: string = obj.secretKey;
                  const contentHash: string = obj.contentHash;
                  const filename: string = obj.filename;
                  setMetadata({ secretKey, contentHash, filename });
                } catch (e) {
                  dispatchSnackbarMessage(errorMessage('Error in Metadata file', e));
                }
              }}
              name="file"
            />
          ) : (
            <Stack spacing={1}>
              <Stack direction={'row'} spacing={1}>
                <CheckCircleIcon sx={{ color: 'green' }} />
                <span>
                  <b>Content Hash:</b> {metadata.contentHash}
                </span>{' '}
                <span>
                  <b>Secret Key:</b> {metadata.secretKey}
                </span>
              </Stack>
            </Stack>
          )}
        </Stack>
      </Stack>

      <Stack key={'Step-3'} spacing={3} sx={{ border: 'solid 2px gray', borderRadius: '' }} p={2}>
        <Stack key={'toolbar'} direction={'row'} justifyContent="space-between" alignItems="baseline">
          <LDBox sx={{ fontSize: '1.3em', margin: '1em 0 0.4em 0' }}>Step 3: Check and Download Decrypted File</LDBox>
          <Button
            key={'check-encryption'}
            disabled={!encryptedFile || !encryptedContentHash || !metadata}
            onClick={async () => {
              if (encryptedFile && encryptedContentHash && metadata) {
                const res: StatusMessage = await wrap('Decrypt and check hash processing...', () =>
                  checkAndDownload(encryptedFile, metadata, false)
                );
                setCheckMessage(res);
              }
            }}
          >
            Decrypt and Check Content Hash
          </Button>

          <Button
            key={'download-decrypted'}
            disabled={!encryptedFile || !encryptedContentHash || !metadata}
            onClick={async () => {
              if (encryptedFile && encryptedContentHash && metadata) {
                const res: StatusMessage = await wrap('Decrypt and Download processing...', () =>
                  checkAndDownload(encryptedFile, metadata, true)
                );
                setCheckMessage(res);
              }
            }}
          >
            Decrypt and Download
          </Button>
        </Stack>
        <Stack>
          <StatusMessageElement onClose={() => setCheckMessage(undefined)} statusMessage={checkMessage} />
        </Stack>
      </Stack>
    </Stack>
  );
}

async function checkAndDownload(encryptedFile: File, metadata: Metadata, download = false): Promise<StatusMessage> {
  const keyPair = secretKey2BoxKeyPair(metadata.secretKey);
  const arrayBuffer = await encryptedFile.arrayBuffer();
  const encryptedContent = new Uint8Array(arrayBuffer);
  const blob = await decryptFile(encryptedContent, keyPair, encryptedFile.name);
  if (isStatusMessage(blob)) {
    return blob;
  } else {
    const array = new Uint8Array(await blob.arrayBuffer());
    const hash = await createSha256Hash(array);
    if (hash.toLowerCase() === metadata.contentHash.toLowerCase()) {
      if (download) {
        saveAs(blob, decryptedFilename(metadata.filename, metadata.contentHash));
      }
      return infoMessage('Content Hash is Ok!');
    } else {
      return errorMessage('Content Hash Check Failed!');
    }
  }
}
