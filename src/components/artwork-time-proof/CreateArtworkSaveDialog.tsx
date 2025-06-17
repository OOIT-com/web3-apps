import DialogTitle from '@mui/material/DialogTitle';
import { FC, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { NotifyCommandFun } from '../../types';
import {
  ArtworkMetaData,
  ArtworkTimeProof,
  UploadInfo
} from '../../contracts/artwork-time-proof/ArtworkTimeProof-support';
import { Box, Button, Stack } from '@mui/material';
import { ButtonPanel } from '../common/ButtonPanel';
import { IrysAccess, ResponseType } from '../../utils/IrysAccess';
import { Buffer } from 'buffer';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { isFile, Tag } from './types';
import { TableComp } from '../common/TableComp';
import { TableRowInfo } from '../common/TableRowInfo';
import { useAppContext } from '../AppContextProvider';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import moment from 'moment';
import { downloadLink } from '../../utils/irys-utils';
import { formatIso } from '../../utils/moment-utils';
import { errorMessage, infoMessage, isStatusMessage, StatusMessage, successMessage } from '../../utils/status-message';

export const CreateArtworkSaveDialog: FC<{
  irysAccess: IrysAccess;
  artworkTimeProof: ArtworkTimeProof;
  data: Uint8Array | File;
  metaData: ArtworkMetaData;
  done: NotifyCommandFun;
}> = ({ irysAccess, artworkTimeProof, data, metaData, done }) => {
  const { wrap } = useAppContext();
  const [uploadInfo, setUploadInfo] = useState<UploadInfo>();
  const [uploadStatusMessage, setUploadStatusMessage] = useState<StatusMessage>();
  const [registerStatusMessage, setRegisterStatusMessage] = useState<StatusMessage>();

  const { filename, artworkName, artworkDescription, artworkAuthor } = metaData;
  return (
    <Dialog open={true} onClose={() => done('cancel')} maxWidth={'md'} fullWidth={true}>
      <DialogTitle>Save Artwork to Blockchain</DialogTitle>
      <DialogContent>
        <Stack spacing={1}>
          <CollapsiblePanel key={'meta-data'} collapsible={false} level={'fourth'} title={'Artwork Meta Data'}>
            <TableComp key={'meta-data-table'}>
              <TableRowInfo key={'file-name'} label={'File name'} value={filename} />
              <TableRowInfo key={'artwork-name'} label={'Artwork Name'} value={artworkName} />
              <TableRowInfo key={'artwork-description'} label={'Artwork Description'} value={artworkDescription} />
              <TableRowInfo key={'artwork-author'} label={'Artwork Author'} value={artworkAuthor} />
            </TableComp>
          </CollapsiblePanel>

          {!!uploadInfo && (
            <Box key={'upload-response'} sx={{ whiteSpace: 'nowrap' }}>
              {JSON.stringify(uploadInfo, null, ' ')}
            </Box>
          )}
          {/*{ "artworkName": "black-white.jpg", "artworkDescription": "black and white", "dataHash": "1443aca4a24daa4be08fb2e83cfae25f4f15c0c7520f8f9826b7dc374ba041fd", "filename": "black-white.jpg", "filemime": "image/jpeg", "filedate": "2025-04-12 17:31", "filesize": 367615, "uploadId": "35n6Uf4EQMUDuCWJTGsr9oK6yf5agZaUb1x9Rsy9EAd2", "timestamp": "2025-06-17 17:13" }*/}

          <StatusMessageElement
            key={'upload-status-message'}
            statusMessage={uploadStatusMessage}
            onClose={() => setUploadStatusMessage(undefined)}
          />
          {!!uploadInfo && (
            <CollapsiblePanel key={'upload-data'} collapsible={false} level={'fourth'} title={'Upload Response'}>
              <TableComp key={'upload-data-table'}>
                <TableRowInfo key={'upload-id'} label={'Upload Id'} value={uploadInfo.id} />
                <TableRowInfo key={'version'} label={'Version'} value={uploadInfo.version} />{' '}
                <TableRowInfo
                  key={'timestamp'}
                  label={'Timestamp'}
                  value={moment(uploadInfo.timestamp).format('YYYY-MM-DD HH:mm')}
                />
                <TableRowInfo key={'link'} label={'Link'} type={'link'} value={downloadLink(uploadInfo.uploadId)} />
              </TableComp>
            </CollapsiblePanel>
          )}

          <StatusMessageElement
            key={'register-status-message'}
            statusMessage={registerStatusMessage}
            onClose={() => setRegisterStatusMessage(undefined)}
          />
          <ButtonPanel key={'buttons'} mode={'left'}>
            {!uploadStatusMessage && (
              <Button
                key={'upload-and-regiester-artwork'}
                variant={'contained'}
                onClick={async () => {
                  setUploadInfo(undefined);
                  await wrap('Upload File And Register Artwork', async () => {
                    let dataBuff: Buffer | undefined;
                    if (isFile(data)) {
                      const arr = await data.arrayBuffer();
                      dataBuff = Buffer.from(arr);
                    } else {
                      dataBuff = Buffer.from(data);
                    }

                    const tags: Tag[] = Object.keys(metaData).map((k) => ({
                      name: k,
                      value: (metaData[k] ?? '').toString()
                    }));
                    const ur: StatusMessage | ResponseType = await irysAccess.upload(dataBuff, tags);
                    if (isStatusMessage(ur)) {
                      setUploadStatusMessage(ur);
                      return;
                    }
                    if (!ur) {
                      setUploadStatusMessage(errorMessage('Empty Response from Irys upload!'));
                      return;
                    }

                    const uploadInfo = {
                      ...metaData,
                      uploadId: ur.id,
                      timestamp: formatIso(ur.timestamp ?? 0)
                    };
                    setUploadInfo(uploadInfo);

                    setUploadStatusMessage(successMessage(`File ${filename} uploaded to Irys!`));

                    const registerResponse = await registerArtwork({
                      artworkTimeProof,
                      metaData,
                      uploadInfo
                    });
                    if (isStatusMessage(registerResponse)) {
                      setRegisterStatusMessage(registerResponse);
                      return;
                    }
                    setRegisterStatusMessage(successMessage(`Artwork ${artworkName} registered!`));
                  });
                }}
              >
                Upload File And Register Artwork
              </Button>
            )}
            {registerStatusMessage && registerStatusMessage.status !== 'success' && (
              <Button
                key={'try-register-again'}
                variant={'contained'}
                disabled={!uploadInfo}
                onClick={async () => {
                  if (uploadInfo) {
                    const res = wrap(`Retry to register ${artworkName}`, () =>
                      registerArtwork({
                        artworkTimeProof,
                        metaData,
                        uploadInfo
                      })
                    );
                    if (isStatusMessage(res)) {
                      setRegisterStatusMessage(res);
                      return;
                    }
                    setUploadInfo(undefined);
                    setRegisterStatusMessage(infoMessage(`${artworkName} registered!`));
                  }
                }}
              >
                Try Register Again {registerStatusMessage?.status}
              </Button>
            )}
          </ButtonPanel>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

const registerArtwork = async ({
  artworkTimeProof,
  metaData,
  uploadInfo
}: {
  artworkTimeProof: ArtworkTimeProof;
  metaData: ArtworkMetaData;
  uploadInfo: UploadInfo;
}) => {
  const { artworkName, artworkDescription = '', artworkAuthor = '', dataHash } = metaData;
  return await artworkTimeProof.addArtwork({
    name: artworkName,
    description: artworkDescription,
    author: artworkAuthor,
    hash: dataHash,
    uploadInfo
  });
};
