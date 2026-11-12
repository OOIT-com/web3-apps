import * as React from 'react';
import { FC, useState } from 'react';
import { UploadInfo } from '../../contracts/artwork-time-proof/ArtworkTimeProof-support';
import { isStatusMessage, StatusMessage } from '../../shared/status-message';
import { useAppContext } from '../AppContextProvider';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { Button } from '@mui/material';
import { downloadLink } from '../../utils/irys-utils';
import { fetchAsUint8Array, resolveFileType } from '../../utils/web-utils';
import { decryptArtwork } from './artwork-api';
import { saveAs } from 'file-saver';
import { getNetworkInfo } from '../../network-info';

export const DownloadAndDecryptButton: FC<{ uploadInfo: UploadInfo }> = ({ uploadInfo }) => {
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const { web3Session, wrap } = useAppContext();

  const { uploadId, filename, encryptionKeyLocation } = uploadInfo;

  const networkInfo = getNetworkInfo(web3Session?.chainId || -1);
  const isMainnet = networkInfo?.isMainnet;

  if (!web3Session) {
    return <></>;
  }
  if (statusMessage) {
    return <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />;
  }

  return (
    <Button
      key={'download & decrypt'}
      variant={'contained'}
      onClick={async () => {
        const link = downloadLink(uploadId, isMainnet);
        //         secretKey from dialog...

        if (!encryptionKeyLocation || !web3Session) {
          return;
        }

        const wrapRes = await wrap('Retrieving Artwork...', async () => {
          const artworkData = await fetchAsUint8Array(link);
          if (isStatusMessage(artworkData)) {
            return artworkData;
          }
          const decryptData = await decryptArtwork({
            artworkData,
            encryptionKeyLocation,
            web3Session,
            secretKey: new Uint8Array()
          });
          if (isStatusMessage(decryptData)) {
            return decryptData;
          }
          const blob = new Blob([decryptData], { type: resolveFileType(filename) });
          saveAs(blob, filename);
        });
        if (wrapRes) {
          setStatusMessage(wrapRes);
        }
      }}
    >
      download & decrypt
    </Button>
  );
};
