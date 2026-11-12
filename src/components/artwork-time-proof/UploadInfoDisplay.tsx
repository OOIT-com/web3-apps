import { UploadInfo } from '../../contracts/artwork-time-proof/ArtworkTimeProof-support';
import { Button, Paper, Stack, Table, TableBody, TableContainer } from '@mui/material';
import { TableRowInfo } from '../common/TableRowInfo';
import { DownloadAndDecryptButton } from './DownloadAndDecryptButton';
import { saveAs } from 'file-saver';
import { downloadLink } from '../../utils/irys-utils';
import * as React from 'react';
import { FC } from 'react';
import { useAppContext } from '../AppContextProvider';
import { getNetworkInfo } from '../../network-info';
import { ExternalLink } from '../common/ExternalLink';

export const UploadiInfoDisplay: FC<{ uploadInfo: UploadInfo }> = ({ uploadInfo }) => {
  const { web3Session } = useAppContext();

  if (!web3Session) {
    return <></>;
  }

  const chainId = web3Session.chainId;

  const networkInfo = getNetworkInfo(chainId);

  const downloadLinkUrl = networkInfo.isMainnet
    ? `https://gateway.irys.xyz/${uploadInfo.uploadId}`
    : `https://devnet.irys.xyz/${uploadInfo.uploadId}`;

  return (
    <TableContainer key="table" component={Paper}>
      <Table sx={{ minWidth: 800 }}>
        <TableBody>
          <TableRowInfo key={'uploadId'} label={'Upload Id'} value={uploadInfo.uploadId} />
          <TableRowInfo key={'timestamp'} label={'Timestamp'} value={uploadInfo.timestamp} />
          <TableRowInfo key={'filename'} label={'Filename'} value={uploadInfo.filename} />
          <TableRowInfo
            key={'encryptionKeyLocation'}
            label={'Encryption Key Location'}
            value={uploadInfo.encryptionKeyLocation}
          />

          <TableRowInfo
            key={'raw-downloads'}
            label={'Download Link'}
            value={<ExternalLink url={downloadLinkUrl} filename={uploadInfo.filename} />}
          />

          {!!uploadInfo.encryptionKeyLocation && (
            <TableRowInfo
              key={'download'}
              label={'Download'}
              value={
                <Stack direction={'row'} spacing={2}>
                  <DownloadAndDecryptButton uploadInfo={uploadInfo} />{' '}
                  <Button
                    key={'download-button'}
                    variant={'contained'}
                    onClick={() => {
                      const filename = uploadInfo.encryptionKeyLocation
                        ? `enc-${uploadInfo.filename}`
                        : uploadInfo.filename;
                      saveAs(downloadLink(uploadInfo.uploadId, networkInfo.isMainnet), filename);
                    }}
                  >
                    download
                  </Button>
                </Stack>
              }
            />
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
