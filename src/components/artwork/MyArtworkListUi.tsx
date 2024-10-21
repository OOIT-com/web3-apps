import * as React from 'react';
import { ChangeEvent, FC, ReactNode, useCallback, useEffect, useState } from 'react';
import { Button, Stack, TextField } from '@mui/material';
import { ArtworkEntry, ArtworkTimeProof } from '../../contracts/artwork-time-proof/ArtworkTimeProof-support';
import { isStatusMessage, StatusMessage } from '../../types';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { useAppContext } from '../AppContextProvider';
import { getMyArtworks } from './artwork-api';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { ArtworkDetailUi } from './ArtworkDetailUi';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import { ArtworkTable } from './ArtworkTable';

export const MyArtworkListUi: FC<{ artworkTimeProof: ArtworkTimeProof }> = ({ artworkTimeProof }) => {
  const { wrap } = useAppContext();
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [artworkList, setArtworkList] = useState<ArtworkEntry[]>([]);
  const [filterValue, setFilterValue] = useState('');
  const [artworkDetail, setArtworkDetail] = useState<ArtworkEntry>();

  const refreshArtworkList = useCallback(async () => {
    const artworkList = await wrap('Loading my Artwork entries...', () => getMyArtworks(artworkTimeProof));
    if (isStatusMessage(artworkList)) {
      setStatusMessage(artworkList);
    } else {
      setArtworkList(artworkList);
    }
  }, [wrap, artworkTimeProof]);

  useEffect(() => {
    refreshArtworkList().catch(console.error);
  }, [refreshArtworkList]);

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
      rows={artworkList}
      refresh={refreshArtworkList}
      action={(artwork) => setArtworkDetail(artwork)}
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

  return <CollapsiblePanel title={'My Artworks'} content={content} collapsible={false} />;
};
