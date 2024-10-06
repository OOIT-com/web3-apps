import * as React from 'react';
import { ChangeEvent, ReactNode, useCallback, useEffect, useState } from 'react';
import {
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField
} from '@mui/material';
import { ArtworkTimeProof, ArtworkType } from '../../contracts/artwork-time-proof/ArtworkTimeProof-support';
import { isStatusMessage, NotifyFun, StatusMessage } from '../../types';
import moment from 'moment';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { useAppContext } from '../AppContextProvider';
import { getMyArtworks } from './artwork-api';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { ArtworkDetailUi } from './ArtworkDetailUi';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';

export function MyArtworks({ artworkTimeProof }: Readonly<{ artworkTimeProof?: ArtworkTimeProof }>) {
  const { wrap } = useAppContext();
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [rows, setRows] = useState<ArtworkType[]>([]);
  const [filterValue, setFilterValue] = useState('');
  const [artworkDetail, setArtworkDetail] = useState<ArtworkType>();

  const refresh = useCallback(async () => {
    if (artworkTimeProof) {
      const res = await wrap('Loading my Artwork entries...', () => getMyArtworks(artworkTimeProof));
      if (isStatusMessage(res)) {
        setStatusMessage(res);
      } else {
        setRows(res);
      }
    }
  }, [wrap, artworkTimeProof]);

  useEffect(() => {
    refresh().catch(console.error);
  }, [refresh]);

  const content: ReactNode[] = [
    <StatusMessageElement
      key={'statusMessage'}
      statusMessage={statusMessage}
      onClose={() => setStatusMessage(undefined)}
    />,
    <Stack key={'search'} direction={'row'} justifyContent="space-between" alignItems="center" spacing={2} mb={'1em'}>
      <TextField
        size={'small'}
        label={'Name filter'}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setFilterValue(e.target.value)}
        value={filterValue}
      />
    </Stack>,
    <ArtworkTable
      key={'table'}
      filterValue={filterValue}
      rows={rows}
      refresh={refresh}
      action={(_, artwork) => setArtworkDetail(artwork)}
    />
  ];

  if (artworkDetail) {
    content.push(
      <Dialog
        key={'artwork-detail-dialog'}
        open={true}
        fullWidth={true}
        maxWidth={'xl'}
        onClose={() => setArtworkDetail(undefined)}
      >
        <DialogTitle>{`Artwork: ${artworkDetail.name}`}</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <ArtworkDetailUi artwork={artworkDetail} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setArtworkDetail(undefined)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return <CollapsiblePanel title={'My Artwork Proofs'} content={content} collapsible={false} />;
}

function ArtworkTable({
  filterValue,
  rows,
  refresh,
  action
}: Readonly<{
  filterValue: string;
  rows: ArtworkType[];
  refresh: NotifyFun;
  action: (a: string, item: ArtworkType) => void;
}>) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 800 }}>
        <TableHead>
          <TableRow>
            <TableCell key={'name'}>Name</TableCell>
            <TableCell key={'description'}>Description</TableCell>
            <TableCell key={'hash'}>Hash</TableCell>
            <TableCell key={'time'}>Added at</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows
            .filter((row) => row.name.includes(filterValue))
            .map((row) => (
              <TableRow
                sx={{ cursor: 'pointer' }}
                hover={true}
                onClick={() => {
                  action('select', { ...row });
                }}
                key={row.hash}
              >
                <TableCell key={'name'}>{row.name}</TableCell>
                <TableCell key={'description'}>{row.description}</TableCell>
                <TableCell key={'hash'}>{row.hash}</TableCell>
                <TableCell key={'time'}>
                  {moment(1000 * +(row.timestamp?.toString() ?? 0)).format('YYYY-MM-DD HH:mm')}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
        <Button onClick={refresh}>Refresh</Button>
      </Stack>
    </TableContainer>
  );
}
