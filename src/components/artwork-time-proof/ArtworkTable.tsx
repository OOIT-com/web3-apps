import * as React from 'react';
import { FC, useState } from 'react';
import {
  ArtworkEntry,
  EncryptionKeyLocation,
  UploadInfo
} from '../../contracts/artwork-time-proof/ArtworkTimeProof-support';
import { NotifyFun } from '../../types';
import { Button, Paper, Stack, TableCell, TableContainer, TableRow } from '@mui/material';
import { TableComp } from '../common/TableComp';
import { TableRowComp } from '../common/TableRowComp';
import { formatIso1000 } from '../../utils/moment-utils';
import { displayKey } from '../../utils/enc-dec-utils';
import { saveAs } from 'file-saver';
import { downloadLink } from '../../utils/irys-utils';
import { decryptArtwork } from './artwork-api';
import { useAppContext } from '../AppContextProvider';
import { Web3NotInitialized } from '../common/Web3NotInitialized';
import { fetchAsUint8Array, resolveFileType } from '../../utils/web-utils';
import { isStatusMessage, StatusMessage } from '../../utils/status-message';
import { StatusMessageElement } from '../common/StatusMessageElement';

export const ArtworkTable: FC<{
  filterValue: string;
  artworkEntries: ArtworkEntry[];
  refresh: NotifyFun;
  action: (item: ArtworkEntry, a?: string) => void;
}> = ({ filterValue, artworkEntries, refresh, action }) => {
  const { web3Session } = useAppContext();
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();

  if (!web3Session?.publicKey) {
    return <Web3NotInitialized />;
  }
  if (statusMessage) {
    return <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />;
  }

  return (
    <TableContainer component={Paper}>
      <TableComp
        header={<TableRowComp elements={['Proven Time', 'Artwork Name', 'File Hash', 'Download']} key={'header'} />}
      >
        {artworkEntries
          .filter((row) => row.name.includes(filterValue))
          .map((row) => {
            const uploadInfo: UploadInfo = row.uploadInfo ?? {};
            const onClick = () => action({ ...row, uploadInfo });

            return (
              <TableRow sx={{ cursor: 'pointer' }} hover={true} key={row.hash + row.timestamp}>
                <TableCell key={'time'} onClick={onClick}>
                  {formatIso1000(+(row.timestamp?.toString() ?? 0))}
                </TableCell>
                <TableCell key={'name'} onClick={onClick}>
                  {row.name}
                </TableCell>
                <TableCell key={'hash'} onClick={onClick}>
                  {displayKey(row.hash)}
                </TableCell>
                <TableCell key={'link'}></TableCell>
              </TableRow>
            );
          })}
      </TableComp>
      <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
        <Button onClick={refresh}>Refresh</Button>
      </Stack>
    </TableContainer>
  );
};
