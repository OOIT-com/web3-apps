import { FC, useState } from 'react';
import { AttributeDef, PRecord } from '../../ui-factory/types';
import { ArtworkType } from '../../contracts/artwork-time-proof/ArtworkTimeProof-support';
import { AttributeTableUi } from '../../ui-factory/AttributeTableUi';
import { toPRecord } from '../../ui-factory/utils';
import moment from 'moment';
import { Box, Stack } from '@mui/material';

const attDefs: AttributeDef[] = [
  { name: 'name' },
  { name: 'description' },
  { name: 'author' },
  { name: 'hash' },
  { name: 'locationUri', uiType: ({ value }) => <Box>{value.toString().substring(0, 100)}</Box> },
  { name: 'timestamp', formatter: (value) => moment(+value * 1000).format('YYYY-MM-DD HH:mm') },
  {
    name: 'download',
    uiType: ({ cx }) => (
      <a href={process.env.REACT_APP_IRYS_GATEWAY + JSON.parse((cx?.locationUri || '{}').toString()).id}>download</a>
    )
  },
  {
    name: 'debug',
    uiType: ({ cx }) => (
      <Stack sx={{ maxWidth: '40em', overflow: 'auto' }}>
        <pre>{JSON.stringify(cx, null, ' ')}</pre>
      </Stack>
    )
  }
];

export const ArtworkDetailUi: FC<{ artwork: ArtworkType; editable?: boolean }> = ({ artwork, editable = false }) => {
  const [data, setData] = useState<PRecord>(toPRecord(artwork));
  const attributeDefs = attDefs.map((e) => ({ ...e, editable }));
  return <AttributeTableUi attributeDefs={attributeDefs} setData={setData} data={data} />;
};
