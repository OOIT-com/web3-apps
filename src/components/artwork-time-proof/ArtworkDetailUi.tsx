import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import { AttributeDef, PRecord } from '../../ui-factory/types';
import { ArtworkEntry, UploadInfo } from '../../contracts/artwork-time-proof/ArtworkTimeProof-support';
import { AttributeTableUi } from '../../ui-factory/AttributeTableUi';
import { toPRecord } from '../../ui-factory/utils';
import { formatIso1000 } from '../../utils/moment-utils';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { errorMessage } from '../../utils/status-message';
import { UploadiInfoDisplay } from './UploadInfoDisplay';

const attDefs: AttributeDef[] = [
  { name: 'name' },
  { name: 'description' },
  { name: 'author', label: 'Author Label' },
  {
    name: 'hash',
    label: 'Hash Proof'
  },
  {
    name: 'timestamp',
    label: 'Timestamp Proof',
    formatter: (value) => {
      console.debug(`timestamp: ${value}`);
      return formatIso1000(+(value?.toString() ?? 0));
    }
  },
  {
    name: 'uploadInfo',
    noLabel: true,
    uiType: ({ cx }) => {
      const uploadInfoStr = cx?.uploadInfo as string;
      if (uploadInfoStr) {
        try {
          const uploadInfo = JSON.parse(uploadInfoStr) as UploadInfo;
          return <UploadiInfoDisplay uploadInfo={uploadInfo} />;
        } catch (e) {
          return <StatusMessageElement statusMessage={errorMessage('Could not read upload info', e)} />;
        }
      }
      return <></>;
    }
  }
];

export const ArtworkDetailUi: FC<{ artwork: ArtworkEntry; editable?: boolean }> = ({ artwork, editable = false }) => {
  const [data, setData] = useState<PRecord>();

  useEffect(() => {
    if (!artwork) {
      return;
    }
    const data = toPRecord(artwork);
    setData(data);
  }, [artwork]);

  const attributeDefs = attDefs.map((e) => ({ ...e, editable }));

  return <AttributeTableUi attributeDefs={attributeDefs} data={data || {}} />;
};
