import { FC, useEffect, useState } from 'react';
import { AttributeDef, PRecord } from '../../ui-factory/types';
import { ArtworkEntry } from '../../contracts/artwork-time-proof/ArtworkTimeProof-support';
import { AttributeTableUi } from '../../ui-factory/AttributeTableUi';
import { toPRecord } from '../../ui-factory/utils';
import { Stack } from '@mui/material';
import { formatIso1000 } from '../../utils/moment-utils';
import { downloadLink } from '../../utils/irys-utils';
import { UploadInfo } from './types';

const attDefs: AttributeDef[] = [
  { name: 'name' },
  { name: 'description' },
  { name: 'author' },
  { name: 'hash' },
  //{ name: 'locationUri', uiType: ({ value }) => <Box>{value.toString().substring(0, 100)}</Box> },
  { name: 'timestamp', formatter: (value) => formatIso1000(+value) },
  { name: 'filename' },
  { name: 'filemime' },
  {
    name: 'download',
    uiType: ({ cx }) => {
      const uploadInfo: UploadInfo = JSON.parse((cx?.locationUri || '{}').toString());
      return <a href={downloadLink(uploadInfo.uploadId)}>download</a>;
    }
  },
  {
    name: 'debug',
    uiType: ({ cx }) => (
      <Stack sx={{ maxWidth: '40em', overflow: 'auto' }}>
        <pre>sss{JSON.stringify(cx?.locationUri, null, ' ')}</pre>
      </Stack>
    )
  }
];

export const ArtworkDetailUi: FC<{ artwork: ArtworkEntry; editable?: boolean }> = ({ artwork, editable = false }) => {
  const [data, setData] = useState<PRecord>();

  useEffect(() => {
    if (!artwork) {
      return;
    }
    let data = toPRecord(artwork);
    if (data?.locationUri) {
      try {
        data = { ...data, ...JSON.parse(data.locationUri?.toString() ?? '{}') };
      } catch (e) {}
    }
    setData(data);
  }, [artwork]);

  const attributeDefs = attDefs.map((e) => ({ ...e, editable }));

  return <AttributeTableUi attributeDefs={attributeDefs} setData={setData} data={data || {}} />;
};
