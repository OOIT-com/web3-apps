import * as React from 'react';
import { FC, useState } from 'react';
import { UploadInfo } from '../../contracts/artwork-time-proof/ArtworkTimeProof-support';
import { isStatusMessage, StatusMessage } from '../../utils/status-message';
import { useAppContext } from '../AppContextProvider';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { Button } from '@mui/material';
import { downloadLink } from '../../utils/irys-utils';
import { fetchAsUint8Array, resolveFileType } from '../../utils/web-utils';
import { decryptArtwork } from './artwork-api';
import { saveAs } from 'file-saver';

export const DownloadAndDecryptButton: FC<{ uploadInfo: UploadInfo }> = ({ uploadInfo }) => {
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const { web3Session } = useAppContext();

  const { uploadId, filename, encryptionKeyLocation } = uploadInfo;
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
        const link = downloadLink(uploadId);
        //         secretKey from dialog...

        if (!encryptionKeyLocation || !web3Session) {
          return;
        }

        const artworkData = await fetchAsUint8Array(link);
        if (isStatusMessage(artworkData)) {
          setStatusMessage(artworkData);
          return;
        }
        const res = await decryptArtwork({
          artworkData,
          encryptionKeyLocation,
          web3Session,
          secretKey: new Uint8Array()
        });
        if (isStatusMessage(res)) {
          setStatusMessage(res);
          return;
        }
        const blob = new Blob([res], { type: resolveFileType(filename) });
        saveAs(blob, filename);
      }}
    >
      download & decrypt
    </Button>
  );
};
