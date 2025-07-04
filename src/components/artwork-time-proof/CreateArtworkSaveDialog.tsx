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
import { IrysAccess } from '../../utils/IrysAccess';
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
import { errorMessage, infoMessage, isStatusMessage, StatusMessage } from '../../utils/status-message';

export const CreateArtworkSaveDialog: FC<{
  irysAccess: IrysAccess;
  artworkTimeProof: ArtworkTimeProof;
  data: Uint8Array | File;
  metaData: ArtworkMetaData;
  done: NotifyCommandFun;
}> = ({ irysAccess, artworkTimeProof, data, metaData, done }) => {
  const { wrap } = useAppContext();
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [uploadInfo, setUploadInfo] = useState<UploadInfo>();
  const [uploadStatusMessage, setUploadStatusMessage] = useState<StatusMessage>();
  const [registerStatusMessage, setRegisterStatusMessage] = useState<StatusMessage>();

  const { filename, artworkName, artworkDescription, artworkAuthor } = metaData;
  return (
    <Dialog open={true} onClose={() => done('cancel')} maxWidth={'md'} fullWidth={true}>
      <DialogTitle>Save Artwork to Blockchain</DialogTitle>
      <DialogContent>
        <Stack spacing={1}>
          <CollapsiblePanel key={'meta-data'} collapsible={false} level={'fourth'} title={'Meta Data'}>
            <TableComp key={'meta-data-table'}>
              <TableRowInfo key={'file-name'} label={'File name'} value={filename} />
              <TableRowInfo key={'artwork-name'} label={'Artwork Name'} value={artworkName} />
              <TableRowInfo key={'artwork-description'} label={'Artwork Description'} value={artworkDescription} />
              <TableRowInfo key={'artwork-author'} label={'Artwork Author'} value={artworkAuthor} />
            </TableComp>
          </CollapsiblePanel>

          <StatusMessageElement
            key={'status-message'}
            statusMessage={statusMessage}
            onClose={() => setStatusMessage(undefined)}
          />

          {!!uploadInfo && (
            <Box key={'upload-response'} sx={{ whiteSpace: 'nowrap' }}>
              {JSON.stringify(uploadInfo, null, ' ')}
            </Box>
          )}

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
          <ButtonPanel
            key={'buttons'}
            mode={'left'}
            content={[
              <Button
                key={'upload-and-regiester-artwork'}
                variant={'contained'}
                disabled={uploadStatusMessage !== undefined}
                onClick={async () => {
                  setUploadInfo(undefined);
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
                  const ur: StatusMessage | any = await irysAccess.upload(dataBuff, tags);
                  if (isStatusMessage(ur)) {
                    setStatusMessage(ur);
                    return;
                  }
                  if (!ur) {
                    setStatusMessage(errorMessage('Empty Response from upload!'));
                    return;
                  }

                  const uploadInfo = {
                    ...metaData,
                    uploadId: ur.id,
                    timestamp: formatIso(ur.timestamp ?? 0)
                  };
                  setUploadInfo(uploadInfo);

                  setUploadStatusMessage(infoMessage(`${filename} uploaded!`));

                  const registerResponse = await registerArtwork({
                    artworkTimeProof,
                    metaData,
                    uploadInfo
                  });
                  if (isStatusMessage(registerResponse)) {
                    setStatusMessage(registerResponse);
                    return;
                  }
                  setRegisterStatusMessage(infoMessage(`${artworkName} registered!`));
                }}
              >
                Upload
              </Button>,
              <Button
                key={'try-register-again'}
                variant={'contained'}
                disabled={registerStatusMessage !== undefined && !uploadInfo}
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
                      setStatusMessage(res);
                      return;
                    }
                    setUploadInfo(undefined);
                    setRegisterStatusMessage(infoMessage(`${artworkName} registered!`));
                  }
                }}
              >
                Try Register Again {registerStatusMessage?.status}
              </Button>
            ]}
          />
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
