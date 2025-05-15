import * as React from 'react';
import { useState } from 'react';
import { Box, Stack } from '@mui/material';
import Button from '@mui/material/Button';
import { FileUploader } from 'react-drag-drop-files';
import { LDBox } from '../common/StyledBoxes';
import { file2string } from '../../utils/misc-util';
import { useAppContext } from '../AppContextProvider';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import { decrypt, secretKey2BoxKeyPair } from '../../utils/nacl-util';
import { createSha256Hash } from '../../utils/crypto-util';
import { saveAs } from 'file-saver';
import { StatusMessageDialog } from '../common/StatusMessageDialog';
import { TableComp } from '../common/TableComp';
import { TableRowComp } from '../common/TableRowComp';
import { errorMessage, isStatusMessage, StatusMessage, successMessage } from '../../utils/status-message';
import { ArtworkMetaData } from '../../contracts/artwork-time-proof/ArtworkTimeProof-support';

export function DecryptFileUi() {
  const { wrap } = useAppContext();
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [encryptedFile, setEncryptedFile] = useState<File>();

  const [metadataFile, setMetadataFile] = useState<File>();
  const [metadata, setMetadata] = useState<ArtworkMetaData>();

  return (
    <Stack spacing={2}>
      <StatusMessageDialog statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />
      <LDBox sx={{ fontSize: '1.6em', margin: '1em 0 0.4em 0' }}>Decryption and Download of Artwork File</LDBox>

      <CollapsiblePanel
        key={'create-artwork-information'}
        title={'Upload encrypted Artwork Files with Meta Data'}
        collapsible={false}
        toolbar={[
          <Button
            key={'clear-button'}
            disabled={!encryptedFile}
            onClick={() => {
              setEncryptedFile(undefined);
              setMetadataFile(undefined);
              setMetadataFile(undefined);
              setMetadata(undefined);
              setStatusMessage(undefined);
            }}
          >
            Clear
          </Button>
        ]}
        content={[
          <TableComp key={'table'}>
            <TableRowComp
              key={'enc-file-row'}
              align={['left', 'left']}
              elements={[
                <FileUploader
                  key={'enc-file-uploader'}
                  handleChange={async (file: File) => {
                    setEncryptedFile(file);
                  }}
                  name="file"
                >
                  <Button fullWidth={true} variant={'contained'}>
                    Upload encrypted Artwork file
                  </Button>
                </FileUploader>,
                <Box key={'file-name-label'}>File Name:</Box>,
                <Box key={'file-name'} sx={{ fontWeight: 'bold' }}>
                  {encryptedFile?.name || '-'}
                </Box>
              ]}
            />
            <TableRowComp
              key={'metadata-row'}
              align={['left', 'left']}
              elements={[
                <FileUploader
                  key={'metadata-uploader'}
                  handleChange={async (file: File) => {
                    setMetadataFile(file);
                    const str = await file2string(file);
                    try {
                      setMetadata(JSON.parse(str));
                      setStatusMessage(successMessage(`Content of MetaData file ${file.name}: ${str}`));
                    } catch (e) {
                      setStatusMessage(errorMessage('Error in Metadata file', e));
                    }
                  }}
                  name="meta"
                >
                  <Button fullWidth={true} variant={'contained'}>
                    Upload MetaData file (secret-metadata.json){' '}
                  </Button>
                </FileUploader>,
                <Box key={'file-name-label'}>MD File Name:</Box>,
                <Box key={'file-name'} sx={{ fontWeight: 'bold' }}>
                  {metadataFile?.name || '-'}
                </Box>
              ]}
            />
          </TableComp>
        ]}
      />

      <CollapsiblePanel
        key={'prepare-artwork-package'}
        level={'second'}
        collapsible={false}
        title={'Check and Download Decrypted File'}
        content={[
          <Button
            key={'check-encryption'}
            variant={'contained'}
            disabled={!encryptedFile || !metadata}
            onClick={async () => {
              if (encryptedFile && metadata) {
                const res: StatusMessage = await wrap('Check Decryption and Hash...', () =>
                  checkEncryptedFile(encryptedFile, metadata)
                );
                setStatusMessage(res);
              }
            }}
          >
            Check decryption and hash
          </Button>,
          <Button
            key={'download-decrypted'}
            variant={'contained'}
            disabled={!encryptedFile || !metadata}
            onClick={async () => {
              if (encryptedFile && metadata) {
                const res = await wrap('Decrypt and download original Artwork...', () =>
                  checkAndDownload(encryptedFile, metadata)
                );
                if (isStatusMessage(res)) {
                  setStatusMessage(res);
                }
              }
            }}
          >
            Decrypt and download original Artwork file
          </Button>
        ]}
      />
    </Stack>
  );
}

async function checkEncryptedFile(encryptedFile: File, metadata: ArtworkMetaData): Promise<StatusMessage> {
  const keyPair = secretKey2BoxKeyPair(metadata.encryptionKey);
  const arrayBuffer = await encryptedFile.arrayBuffer();
  const encryptedContent = new Uint8Array(arrayBuffer);
  const dec = decrypt(keyPair.secretKey, encryptedContent, keyPair.publicKey);
  if (dec === null) {
    return errorMessage('Decryption failed!');
  } else {
    const dataHash = await createSha256Hash(dec);
    if (dataHash.toLowerCase() === metadata.dataHash.toLowerCase()) {
      return successMessage('Decryption and hash check is Ok!');
    } else {
      return errorMessage('Hash check Failed!');
    }
  }
}

async function checkAndDownload(encryptedFile: File, metadata: ArtworkMetaData): Promise<StatusMessage | void> {
  const keyPair = secretKey2BoxKeyPair(metadata.encryptionKey);
  const arrayBuffer = await encryptedFile.arrayBuffer();
  const encryptedContent = new Uint8Array(arrayBuffer);
  const dec = decrypt(keyPair.secretKey, encryptedContent, keyPair.publicKey);
  if (dec === null) {
    return errorMessage('Decryption failed!');
  } else {
    saveAs(new Blob([dec]), metadata.filename);
  }
}
