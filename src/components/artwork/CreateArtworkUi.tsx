import * as React from 'react';
import { useEffect, useState } from 'react';
import { errorMessage, infoMessage, isStatusMessage, StatusMessage, successMessage, warningMessage } from '../../types';
import { Box, Checkbox, Stack, TextField } from '@mui/material';
import Button from '@mui/material/Button';
import { FileUploader } from 'react-drag-drop-files';
import nacl, { box, BoxKeyPair } from 'tweetnacl';
import { saveAs } from 'file-saver';
import { newNonce, secretKey2BoxKeyPair } from '../../utils/nacl-util';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { LDBox } from '../common/StyledBoxes';
import { createSha256Hash } from '../../utils/crypto-util';
import moment from 'moment';
import { ArtworkTimeProof } from '../../contracts/artwork-time-proof/ArtworkTimeProof-support';

import { StatusMessageElement } from '../common/StatusMessageElement';
import { IrysAccess } from '../../utils/IrysAccess';
import { resolveAsStatusMessage } from '../../utils/status-message-utils';
import { UploadResponse } from '@irys/sdk/build/esm/common/types';
import { Buffer } from 'buffer';
import { contentType } from './irys-utils';
import { uint8Array2Hex } from '../../utils/enc-dec-utils';
import { useAppContext } from '../AppContextProvider';

export function CreateArtworkUi({
  irysAccess,
  artworkTimeProof
}: Readonly<{
  irysAccess: IrysAccess;
  artworkTimeProof?: ArtworkTimeProof;
}>) {
  const { wrap, dispatchSnackbarMessage } = useAppContext();

  const [encryptedContent, setEncryptedContent] = useState<Uint8Array>();
  const [keyPair, setKeyPair] = useState<BoxKeyPair>();
  const [contentHash, setContentHash] = useState('');
  const [mime, setMime] = useState('');
  const [encryptedContentHash, setEncryptedContentHash] = useState('');

  const [providedFile, setProvidedFile] = useState<File>();

  const [useEncryption, setUseEncryption] = useState(true);
  const [secretKeyHex, setSecretKeyHex] = useState('');

  const [artworkDescription, setArtworkDescription] = useState('');
  const [artworkAuthor, setArtworkAuthor] = useState('');
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [uploadResponse, setUploadResponse] = useState<UploadResponse>();

  useEffect(() => {
    if (providedFile) {
      wrap('Create SHA-256 Hash and Content-Type from provided file!', async () => {
        const res = await createSha256Hash(providedFile);
        if (isStatusMessage(res)) {
          setStatusMessage(res);
        } else {
          setContentHash(res);
          const content = Buffer.from(await providedFile.arrayBuffer());
          const m = await contentType(content, providedFile.name);
          setMime(m);
        }
      });
    } else {
      setContentHash('');
      setMime('');
      setEncryptedContentHash('');
      setEncryptedContent(undefined);
    }
  }, [wrap, providedFile]);

  return (
    <Stack spacing={2}>
      <LDBox sx={{ fontSize: '1.6em', margin: '1em 0 0.4em 0' }}>Encryption and Proof of Artwork</LDBox>
      <Stack key={'Step-1'} spacing={3} sx={{ border: 'solid 2px gray', borderRadius: '' }} p={2}>
        <Stack key={'toolbar'} direction={'row'} justifyContent="space-between" alignItems="baseline">
          <LDBox sx={{ fontSize: '1.3em', margin: '1em 0 0.4em 0' }}>Provide File (Artwork)</LDBox>
          <Button
            disabled={!providedFile}
            onClick={() => {
              setProvidedFile(undefined);
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
      </Stack>
      {/* Encryption */}
      <Stack key={'Step-2'} spacing={3} sx={{ border: 'solid 2px gray', borderRadius: '' }} p={2}>
        <Stack key={'toolbar'} direction={'row'} justifyContent="space-between" alignItems="baseline">
          <LDBox sx={{ fontSize: '1.3em', margin: '1em 0 0.4em 0' }}>
            Use Encryption{' '}
            <Checkbox size={'small'} onChange={(_, check) => setUseEncryption(check)} checked={useEncryption} />
          </LDBox>
          <Button
            key={'new-key-pair'}
            disabled={!useEncryption || !!keyPair || !!encryptedContent || !!secretKeyHex}
            onClick={() => {
              setSecretKeyHex('');
              setKeyPair(box.keyPair());
            }}
          >
            New Key Pair
          </Button>
          <Button
            key={'create-key-pair'}
            disabled={!secretKeyHex || !!encryptedContent}
            onClick={() => {
              if (secretKeyHex) {
                try {
                  const keyPair0 = secretKey2BoxKeyPair(secretKeyHex);
                  setKeyPair(keyPair0);
                } catch (e: any) {
                  dispatchSnackbarMessage(errorMessage(`Creation of KeyPair failed! ${e?.message}`));
                }
              }
            }}
          >
            Create Key Pair
          </Button>
          <Button
            key={'encrypt-control'}
            disabled={!providedFile || !keyPair || !!encryptedContent}
            onClick={async () => {
              if (providedFile && keyPair && !encryptedContent) {
                await wrap('Encryption running  ...', async () => {
                  const { secretKey, publicKey } = keyPair;
                  const arrayBuffer = await providedFile.arrayBuffer();
                  const data = new Uint8Array(arrayBuffer);
                  const nonce = newNonce();
                  const encrypted = nacl.box(data, nonce, publicKey, secretKey);
                  if (!encrypted) {
                    dispatchSnackbarMessage(errorMessage(`Could not encrypt the ${providedFile.name}!`));
                  } else {
                    const fullEncrypted = new Uint8Array(nonce.length + encrypted.length);
                    fullEncrypted.set(nonce);
                    fullEncrypted.set(encrypted, nonce.length);
                    setEncryptedContent(fullEncrypted);
                    const en = await createSha256Hash(fullEncrypted);
                    setEncryptedContentHash(en);
                  }
                });
              }
            }}
          >
            Encrypt
          </Button>
          <Button
            key={'clear'}
            disabled={!keyPair && !secretKeyHex}
            onClick={() => {
              setKeyPair(undefined);
              setSecretKeyHex('');
              setEncryptedContentHash('');
              setEncryptedContent(undefined);
            }}
          >
            Clear
          </Button>
        </Stack>
        {useEncryption && (
          <Stack key={'keypair'} direction={'row'}>
            {!keyPair ? (
              <TextField
                fullWidth={true}
                placeholder={'-hex-'}
                label={'Secret Key (Hexadecimal)'}
                onChange={(e) => setSecretKeyHex(e.target.value)}
                value={secretKeyHex}
              />
            ) : (
              <Stack spacing={1}>
                <Stack direction={'row'} spacing={1}>
                  <CheckCircleIcon sx={{ color: 'green' }} />
                  <span>
                    <b>Secret Key:</b> {uint8Array2Hex(keyPair.secretKey)}
                  </span>
                </Stack>

                <Stack direction={'row'} spacing={1}>
                  <CheckCircleIcon sx={{ color: 'green' }} />
                  <span>
                    <b>Public Key:</b> {uint8Array2Hex(keyPair.publicKey)}
                  </span>
                </Stack>
                {!!encryptedContentHash && (
                  <Stack direction={'row'} spacing={1}>
                    <CheckCircleIcon sx={{ color: 'green' }} />
                    <span>
                      <b>SHA 256 Hash of encrypted content:</b> {encryptedContentHash}
                    </span>
                  </Stack>
                )}
              </Stack>
            )}
          </Stack>
        )}
      </Stack>

      {
        // Download keys and meta
      }

      <Stack key={'Step-3'} spacing={3} sx={{ border: 'solid 2px gray', borderRadius: '' }} p={2}>
        <Stack key={'toolbar'} direction={'row'} justifyContent="space-between" alignItems="baseline">
          <LDBox sx={{ fontSize: '1.3em', margin: '1em 0 0.4em 0' }}>Download Encrypted File and Meta Data</LDBox>
          <Button
            key={'download-encrypted'}
            disabled={!encryptedContent || !providedFile || !contentHash}
            onClick={async () => {
              if (providedFile && encryptedContent) {
                const blob = new Blob([encryptedContent], { type: 'application/octed' });
                saveAs(blob, encryptedFilename(providedFile, contentHash));
              }
            }}
          >
            Download Encrypted File
          </Button>
          <Button
            key={'download'}
            disabled={!providedFile || !contentHash}
            onClick={async () => {
              if (providedFile && contentHash) {
                saveAs(providedFile, providerFilename(providedFile, contentHash));
              }
            }}
          >
            Download (original) File
          </Button>
          <Button
            key={'Download-Meta-Data'}
            disabled={!encryptedContentHash || !keyPair || !contentHash || !providedFile}
            onClick={() => {
              if (keyPair && contentHash && providedFile && encryptedContentHash) {
                saveMetaData({ providedFile, contentHash, encryptedContentHash, keyPair }).catch(console.error);
              }
            }}
          >
            Download Meta Data
          </Button>
          <Button
            key={'download-all'}
            disabled={!encryptedContentHash || !keyPair || !contentHash || !providedFile || !encryptedContent}
            onClick={async () => {
              if (keyPair && contentHash && providedFile && encryptedContentHash && encryptedContent) {
                const blob = new Blob([encryptedContent], { type: 'application/octed' });
                saveAs(blob, encryptedFilename(providedFile, contentHash));
                saveAs(providedFile, providerFilename(providedFile, contentHash));
                await saveMetaData({ providedFile, contentHash, encryptedContentHash, keyPair });
              }
            }}
          >
            Download All
          </Button>
        </Stack>
      </Stack>
      {/*

      ***  Upload to Arweave ***

      */}
      <Stack key={'Step-upload-to-arweave'} spacing={3} sx={{ border: 'solid 2px gray', borderRadius: '' }} p={2}>
        <Stack key={'toolbar'} justifyContent="space-between" alignItems="baseline">
          <LDBox sx={{ fontSize: '1.3em', margin: '1em 0 0.4em 0' }}>Upload Artwork To Arweave</LDBox>
          <Button
            key={'upload-to-arweave'}
            disabled={!providedFile || (useEncryption && !encryptedContent)}
            onClick={async () => {
              let content: Buffer | null = null;
              if (!contentHash || !providedFile) {
                return warningMessage('No contentHash!');
              }
              const metaData = [
                {
                  name: 'contentHash',
                  value: contentHash
                },
                {
                  name: 'filename',
                  value: providedFile.name
                }
              ];
              if (useEncryption) {
                if (!encryptedContent || !encryptedContentHash || !keyPair) {
                  return warningMessage('No encrypted content!');
                } else {
                  content = Buffer.from(encryptedContent);
                  metaData.push({ name: 'encryptedContentHash', value: encryptedContentHash });
                  metaData.push({ name: 'publicKey', value: uint8Array2Hex(keyPair.publicKey) });
                }
              } else {
                content = Buffer.from(await providedFile.arrayBuffer());
                metaData.push({ name: 'Content-Type', value: mime });
              }

              const res = await wrap('Irys (Arweave) Upload processing...', async () => {
                try {
                  if (!content) {
                    return;
                  }
                  const res = await irysAccess.upload(content, metaData);
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
            }}
          >
            {`Upload ${providedFile?.name ?? '-??-'} to Arweave`}
          </Button>
        </Stack>
        {!!uploadResponse && (
          <Box>
            <pre>{JSON.stringify(uploadResponse, null, ' ')}</pre>
          </Box>
        )}
      </Stack>
      {
        //
        // Save Artwork Data to Contract
        //
      }
      <Stack key={'Step-4'} spacing={3} sx={{ border: 'solid 2px gray', borderRadius: '' }} p={2}>
        <Stack key={'toolbar'} justifyContent="space-between" alignItems="baseline">
          <LDBox sx={{ fontSize: '1.3em', margin: '1em 0 0.4em 0' }}>Create Artwork Time Proof Entry</LDBox>
          {artworkTimeProof ? (
            <Stack spacing={2} sx={{ width: '100%', margin: '1em 0 0.4em 0' }}>
              <TextField
                label={'Artwork Description'}
                value={artworkDescription}
                onChange={(e) => setArtworkDescription(e.target.value)}
                fullWidth={true}
              />
              <TextField
                label={'Artwork Author'}
                value={artworkAuthor}
                onChange={(e) => setArtworkAuthor(e.target.value)}
                fullWidth={true}
              />
              <Button
                key={'add-artwork'}
                disabled={!contentHash || !providedFile || !artworkDescription || !artworkAuthor}
                onClick={async () => {
                  if (contentHash && providedFile && artworkTimeProof) {
                    const res = await wrap('Save Artwork to Contract...', () =>
                      artworkTimeProof.addArtwork({
                        name: providedFile.name,
                        description: artworkDescription,
                        author: artworkAuthor,
                        hash: contentHash,
                        locationUri: JSON.stringify(uploadResponse)
                      })
                    );
                    if (isStatusMessage(res)) {
                      setStatusMessage(res);
                    } else if (res) {
                      setStatusMessage(successMessage(`Successfully add entry ${res}`));
                    }
                  }
                }}
              >
                Publish Artwork Data
              </Button>
            </Stack>
          ) : (
            <StatusMessageElement statusMessage={infoMessage('No Artwork Time Proof Contract available!')} />
          )}
        </Stack>
      </Stack>
      <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />
    </Stack>
  );
}

export async function decryptFile(encryptedContent: Uint8Array, keyPair: BoxKeyPair, filename: string) {
  const nonce = encryptedContent.subarray(0, box.nonceLength);
  const encContent = encryptedContent.subarray(box.nonceLength, encryptedContent.length);
  const decryptedContent = nacl.box.open(encContent, nonce, keyPair.publicKey, keyPair.secretKey);
  if (!decryptedContent) {
    return errorMessage(`Could not decrypt the ${filename}!`);
  } else {
    return new Blob([decryptedContent], { type: 'application/octed' });
  }
}

export function metadataFilename(providedFile: File, contentHash: string) {
  return `${contentHash.substring(0, 8)}-metadata-${providedFile.name}.json`;
}

export function providerFilename(providedFile: File, contentHash: string) {
  return `${contentHash.substring(0, 8)}-original-${providedFile.name}`;
}

export function encryptedFilename(providedFile: File, contentHash: string) {
  return `${contentHash.substring(0, 8)}-encrypted-${providedFile.name}`;
}

export function decryptedFilename(filename: string, contentHash: string) {
  return `${contentHash.substring(0, 8)}-dencrypted-${filename}`;
}

export async function saveMetaData({
  providedFile,
  contentHash,
  encryptedContentHash,
  keyPair
}: {
  providedFile: File;
  contentHash: string;
  encryptedContentHash: string;
  keyPair: BoxKeyPair;
}) {
  const filename = providedFile.name;
  saveMetadataContent(metadataFilename(providedFile, contentHash), {
    filename,
    fileSize: providedFile.size,
    encryptedFilename: encryptedFilename(providedFile, contentHash),
    secretKey: uint8Array2Hex(keyPair.secretKey),
    encryptionMethod: 'NaCl/TweetNaCl BoxKeyPair',
    encryptionAlgorithm: 'EC: Montgomery Curve25519',
    contentHash,
    encryptedContentHash,
    lastModified: moment(providedFile.lastModified).format('YYYY-MM-DD HH:mm')
  });
}

export function saveMetadataContent(metadataFilename: string, content: Record<string, string | number>) {
  const text = JSON.stringify(
    {
      ...content
    },
    null,
    ' '
  );
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, metadataFilename);
}
