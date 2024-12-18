import * as React from 'react';
import { FC } from 'react';
import { ArtworkEntry } from '../../contracts/artwork-time-proof/ArtworkTimeProof-support';
import { NotifyFun } from '../../types';
import { Button, Paper, Stack, TableCell, TableContainer, TableRow } from '@mui/material';
import { TableComp } from '../common/TableComp';
import { TableRowComp } from '../common/TableRowComp';
import { formatIso1000 } from '../../utils/moment-utils';
import { displayKey } from '../../utils/enc-dec-utils';
import { UploadInfo } from './types';
import { saveAs } from 'file-saver';
import { downloadLink } from '../../utils/irys-utils';

export const ArtworkTable: FC<{
  filterValue: string;
  artworkEntries: ArtworkEntry[];
  refresh: NotifyFun;
  action: (item: ArtworkEntry, a?: string) => void;
}> = ({ filterValue, artworkEntries, refresh, action }) => {
  return (
    <TableContainer component={Paper}>
      <TableComp
        header={<TableRowComp elements={['Time', 'Name', 'Description', 'Hash', 'Download']} key={'header'} />}
      >
        {artworkEntries

          .filter((row) => row.name.includes(filterValue))
          .map((row) => (
            <TableRow
              sx={{ cursor: 'pointer' }}
              hover={true}
              onClick={() => {
                action({ ...row });
              }}
              key={row.hash + row.timestamp}
            >
              <TableCell key={'time'}>{formatIso1000(+(row.timestamp?.toString() ?? 0))}</TableCell>
              <TableCell key={'name'}>{row.name}</TableCell>
              <TableCell key={'description'}>{row.description}</TableCell>
              <TableCell key={'hash'}>{displayKey(row.hash)}</TableCell>
              <TableCell key={'link'}>
                {
                  <Button
                    variant={'text'}
                    onClick={() => {
                      const ui: UploadInfo = JSON.parse(row.locationUri?.toString() ?? '{}');
                      const filename = ui.encryptionKeyLocation ? ui.filename + 'enc' : ui.filename;
                      saveAs(downloadLink(ui.uploadId), filename);
                    }}
                  >
                    download
                  </Button>
                }
              </TableCell>
            </TableRow>
          ))}
      </TableComp>
      <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
        <Button onClick={refresh}>Refresh</Button>
      </Stack>
    </TableContainer>
  );
};
