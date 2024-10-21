import * as React from 'react';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { errorMessage, isStatusMessage, StatusMessage } from '../../types';
import { Box, FormControlLabel, Radio, RadioGroup, Stack, TextField } from '@mui/material';
import Button from '@mui/material/Button';
import { FileUploader } from 'react-drag-drop-files';
import { box, BoxKeyPair } from 'tweetnacl';
import { saveAs } from 'file-saver';
import { createSha256Hash } from '../../utils/crypto-util';
import moment from 'moment';
import { ArtworkTimeProof } from '../../contracts/artwork-time-proof/ArtworkTimeProof-support';

import { StatusMessageElement } from '../common/StatusMessageElement';
import { IrysAccess } from '../../utils/IrysAccess';
import { Buffer } from 'buffer';
import { contentType } from './irys-utils';
import { uint8Array2Hex } from '../../utils/enc-dec-utils';
import { useAppContext } from '../AppContextProvider';
import { ButtonPanel } from '../common/ButtonPanel';
import { AddressBoxWithCopy } from '../common/AddressBoxWithCopy';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import { prepareArtwork } from './artwork-api';
import { CreateArtworkSaveDialog } from './CreateArtworkSaveDialog';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { createZip, ZipEntry } from '../../utils/zip-utils';
import { safeFilename } from '../../utils/misc-util';
import { EncryptionType, MetaData } from './types';

export function CreateArtworkUi({
  irysAccess,
  artworkTimeProof
}: Readonly<{
  irysAccess: IrysAccess;
  artworkTimeProof: ArtworkTimeProof;
}>) {
  const { wrap, web3Session } = useAppContext();

  const [uploadFile, setUploadFile] = useState<File>();
  const [encryptedContent, setEncryptedContent] = useState<Uint8Array>();
  const [newKeyPair, setNewKeyPair] = useState<BoxKeyPair>(box.keyPair);
  const [contentHash, setContentHash] = useState('');

  const [encryptionType, setEncryptionType] = useState<EncryptionType>('no-encryption');

  const [metaData, setMetaData] = useState<Partial<MetaData>>({});
  const [secretMd, setSecretMd] = useState<Partial<MetaData>>({});

  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);
  const clearAllData = useCallback(() => {
    setUploadFile(undefined);
    setEncryptedContent(undefined);
    setContentHash('');
    setEncryptionType('no-encryption');
    setMetaData({});
    setStatusMessage(undefined);
  }, []);

  useEffect(() => {
    if (uploadFile) {
      wrap('Create SHA-256 Hash and Content-Type from provided file!', async () => {
        const res = await createSha256Hash(uploadFile);
        if (isStatusMessage(res)) {
          setStatusMessage(res);
        } else {
          setContentHash(res);
        }
      }).catch(console.error);
    } else {
      setContentHash('');
      setEncryptedContent(undefined);
    }
  }, [wrap, uploadFile]);
  const { dataHash, artworkName, artworkDescription, artworkAuthor } = metaData;
  const readyToPrepare = !!uploadFile && !!artworkName && web3Session;
  const isPrepared = !!dataHash && readyToPrepare;
  return (
    <Stack spacing={2}>
      <StatusMessageElement
        key={'status-message'}
        statusMessage={statusMessage}
        onClose={() => setStatusMessage(undefined)}
      />

      <CollapsiblePanel
        key={'create-artwork-information'}
        title={'Artwork Information'}
        collapsible={false}
        toolbar={[
          <Button key={'clear-button'} disabled={!uploadFile} onClick={() => setOpenConfirmDeleteDialog(true)}>
            Clear all
          </Button>
        ]}
        content={[
          <ButtonPanel key={'upload-file-control'} mode={'left'}>
            <FileUploader
              key={'file-upload'}
              handleChange={(file: File) => {
                setUploadFile(file);
                setMetaData((md) => ({ ...md, artworkName: file.name }));
              }}
              name="file"
            >
              <Button variant={'contained'}>Upload Artwork file</Button>
            </FileUploader>
            <Box key={'file-name-label'}>Artwork file name:</Box>{' '}
            <Box key={'file-name'} sx={{ fontWeight: 'bold' }}>
              {uploadFile?.name}
            </Box>
          </ButtonPanel>,
          <RadioGroup
            key={'encryption-type'}
            value={encryptionType}
            row
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setEncryptionType(event.target.value as EncryptionType)
            }
          >
            <FormControlLabel
              key={'no-encryption'}
              value={'no-encryption'}
              control={<Radio />}
              label="Use No encryption"
            />
            <FormControlLabel
              key={'use-public-key-store-v2'}
              value={'use-public-key-store-v2'}
              control={<Radio />}
              label="Use Public Key Store"
            />
            <FormControlLabel key={'new-key-pair'} value={'new-key-pair'} control={<Radio />} label="New Key Pair" />
          </RadioGroup>,
          <Fragment key={'new-key-pair'}>
            {encryptionType === 'new-key-pair' && (
              <ButtonPanel
                mode={'left'}
                key={'new-key-pair-panel'}
                content={[
                  <AddressBoxWithCopy
                    key={'secret-key-hex'}
                    label={'Secret Key for Encryption (Make sure to save it!)'}
                    value={'0x' + Buffer.from(newKeyPair.secretKey).toString('hex')}
                    reduced={false}
                    variant={'outlined'}
                  />,
                  <Button
                    key={'new-key-pair'}
                    onClick={() => {
                      setNewKeyPair(box.keyPair());
                    }}
                  >
                    New Key Pair
                  </Button>
                ]}
              />
            )}
          </Fragment>,
          <TextField
            key={'artwork-name'}
            label={'Artwork Name*'}
            value={artworkName ?? ''}
            onChange={(e) => setMetaData((md) => ({ ...md, artworkName: e.target.value }))}
            fullWidth={true}
          />,
          <TextField
            key={'artwork-description'}
            label={'Artwork Description'}
            value={artworkDescription ?? ''}
            onChange={(e) => setMetaData((md) => ({ ...md, artworkDescription: e.target.value }))}
            fullWidth={true}
          />,
          <TextField
            key={'artwork-author'}
            label={'Artwork Author'}
            value={artworkAuthor ?? ''}
            onChange={(e) => setMetaData((md) => ({ ...md, artworkAuthor: e.target.value }))}
            fullWidth={true}
          />
        ]}
      />

      <CollapsiblePanel
        key={'prepare-artwork-package'}
        level={'second'}
        collapsible={false}
        title={'Prepare Artwork Package'}
        content={[
          <Button
            key={'prepare-package'}
            variant={'contained'}
            disabled={!readyToPrepare}
            onClick={async () => {
              if (readyToPrepare) {
                const md: Partial<MetaData> = { ...metaData };
                const privateMd: Partial<MetaData> = {};

                const prep = await prepareArtwork({
                  encryptionType,
                  artworkFile: uploadFile,
                  web3Session,
                  secretKey: newKeyPair.secretKey
                });
                if (isStatusMessage(prep)) {
                  setStatusMessage(prep);
                  return;
                }
                const { data, dataHash, encryptedDataHash, encryptedData, encryptionSecret, encryptionKeyLocation } =
                  prep;
                md.dataHash = dataHash;
                setEncryptedContent(encryptedData);

                md.filename = uploadFile.name;
                md.filemime = await contentType(Buffer.from(data), uploadFile.name);
                md.filedate = moment(uploadFile.lastModified).format('YYYY-MM-DD HH:mm');
                md.filesize = uploadFile.size;

                if (encryptedData) {
                  md.encryptedFilename = encryptedFilename(uploadFile, contentHash);
                  md.encryptionKeyLocation = encryptionKeyLocation;
                  privateMd.encryptionKey = encryptionSecret ? uint8Array2Hex(encryptionSecret) : '';
                  privateMd.encryptionMethod = encryptionSecret ? 'NaCl/TweetNaCl BoxKeyPair' : '';
                  privateMd.encryptionAlgorithm = encryptionSecret ? 'EC: Montgomery Curve25519' : '';
                  privateMd.encryptedDataHash = encryptedDataHash;
                }
                setMetaData(md);
                setSecretMd({ ...md, ...privateMd });
              } else {
                setStatusMessage(errorMessage('Not ready to prepare Artwork package!'));
              }
            }}
          >
            Prepare Artwork package
          </Button>,
          <Button
            key={'download-package'}
            variant={'contained'}
            disabled={!isPrepared}
            onClick={async () => {
              if (isPrepared) {
                const zipEntries: ZipEntry[] = [];
                const arrayBuffer = await uploadFile.arrayBuffer();
                const data = new Uint8Array(arrayBuffer);
                zipEntries.push({
                  name: 'metadata.json',
                  data: Buffer.from(JSON.stringify(metaData), 'utf8')
                });
                zipEntries.push({
                  name: uploadFile.name,
                  data: Buffer.from(data)
                });
                if (encryptedContent) {
                  zipEntries.push({
                    name: encryptedFilename(uploadFile, contentHash),
                    data: Buffer.from(encryptedContent)
                  });
                  zipEntries.push({
                    name: 'secret-metadata.json',
                    data: Buffer.from(JSON.stringify(secretMd), 'utf8')
                  });
                }

                const zip = await createZip(zipEntries);
                saveAs(new Blob([zip]), safeFilename(metaData.artworkName ?? 'my-artwork') + '.zip');
              }
            }}
          >
            Download Artwork Package
          </Button>,
          <Button
            key={'save-artwork'}
            variant={'contained'}
            disabled={!isPrepared}
            onClick={() => setOpenSaveDialog(true)}
          >
            Save Artwork to Blockchain
          </Button>
        ]}
      />

      {openConfirmDeleteDialog && (
        <ConfirmDialog
          key={'confirm-dialog'}
          confirmData={{
            title: 'Confirm clear form data',
            cancel: () => setOpenConfirmDeleteDialog(false),
            accept: () => {
              clearAllData();
              setOpenConfirmDeleteDialog(false);
            }
          }}
        >
          <Stack>Do you want to clear all data in this form?</Stack>
        </ConfirmDialog>
      )}
      {openSaveDialog && isPrepared && (
        <CreateArtworkSaveDialog
          key={'save-dialog'}
          irysAccess={irysAccess}
          artworkTimeProof={artworkTimeProof}
          metaData={metaData as MetaData}
          data={encryptedContent || uploadFile}
          done={() => {
            setOpenSaveDialog(false);
          }}
        />
      )}

      {/*<Button*/}
      {/*  key={'download-encrypted'}*/}
      {/*  disabled={!encryptedContent || !providedFile || !contentHash}*/}
      {/*  onClick={async () => {*/}
      {/*    if (providedFile && encryptedContent) {*/}
      {/*      const blob = new Blob([encryptedContent], { type: 'application/octed' });*/}
      {/*      saveAs(blob, encryptedFilename(providedFile, contentHash));*/}
      {/*    }*/}
      {/*  }}*/}
      {/*>*/}
      {/*  Download File and MetaData*/}
      {/*</Button>*/}
      {/*<Button*/}
      {/*  key={'download'}*/}
      {/*  disabled={!providedFile || !contentHash}*/}
      {/*  onClick={async () => {*/}
      {/*    if (providedFile && contentHash) {*/}
      {/*      saveAs(providedFile, providerFilename(providedFile, contentHash));*/}
      {/*    }*/}
      {/*  }}*/}
      {/*>*/}
      {/*  Download (original) File*/}
      {/*</Button>*/}
      {/*<Button*/}
      {/*  key={'Download-Meta-Data'}*/}
      {/*  disabled={!encryptedContentHash || !newKeyPair || !contentHash || !providedFile}*/}
      {/*  onClick={() => {*/}
      {/*    if (newKeyPair && contentHash && providedFile && encryptedContentHash) {*/}
      {/*      saveMetaData({*/}
      {/*        providedFile,*/}
      {/*        contentHash,*/}
      {/*        encryptedContentHash,*/}
      {/*        keyPair: newKeyPair*/}
      {/*      }).catch(console.error);*/}
      {/*    }*/}
      {/*  }}*/}
      {/*>*/}
      {/*  Download Meta Data*/}
      {/*</Button>*/}
    </Stack>
  );
}

export function encryptedFilename(providedFile: File, contentHash: string) {
  return `${contentHash.substring(0, 8)}-encrypted-${providedFile.name}`;
}

// export async function downloadMetaData({
//   providedFile,
//   contentHash,
//   encryptedContentHash,
//   keyPair
// }: {
//   providedFile: File;
//   contentHash: string;
//   encryptedContentHash: string;
//   keyPair: BoxKeyPair;
// }) {
//   const filename = providedFile.name;
//   downloadMetadataContent(metadataFilename(providedFile, contentHash), {
//     filename,
//     fileSize: providedFile.size,
//     encryptedFilename: encryptedFilename(providedFile, contentHash),
//     secretKey: uint8Array2Hex(keyPair.secretKey),
//     encryptionMethod: 'NaCl/TweetNaCl BoxKeyPair',
//     encryptionAlgorithm: 'EC: Montgomery Curve25519',
//     contentHash,
//     encryptedContentHash,
//     lastModified: moment(providedFile.lastModified).format('YYYY-MM-DD HH:mm')
//   });
// }
