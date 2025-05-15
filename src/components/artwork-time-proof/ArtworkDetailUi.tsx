import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import { AttributeDef, PRecord } from '../../ui-factory/types';
import { ArtworkEntry, UploadInfo } from '../../contracts/artwork-time-proof/ArtworkTimeProof-support';
import { AttributeTableUi } from '../../ui-factory/AttributeTableUi';
import { toPRecord } from '../../ui-factory/utils';
import { Button, Paper, Stack, Table, TableBody, TableContainer } from '@mui/material';
import { formatIso1000 } from '../../utils/moment-utils';
import { downloadLink } from '../../utils/irys-utils';
import { TableRowInfo } from '../common/TableRowInfo';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { errorMessage } from '../../utils/status-message';
import { DownloadAndDecryptButton } from './DownloadAndDecryptButton';
import { saveAs } from 'file-saver';

const attDefs: AttributeDef[] = [
  { name: 'name' },
  { name: 'description' },
  { name: 'author' },
  { name: 'hash' },
  {
    name: 'timestamp',
    formatter: (value) => {
      console.debug(`timestamp: ${value}`);
      return formatIso1000(+(value?.toString() ?? 0));
    }
  },
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
    name: 'uploadInfo',
    uiType: ({ cx }) => {
      const uploadInfoStr = cx?.uploadInfo as string;
      if (uploadInfoStr) {
        try {
          const uploadInfo = JSON.parse(uploadInfoStr) as UploadInfo;
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
                    key={'download'}
                    label={'Download'}
                    value={
                      <div>
                        <DownloadAndDecryptButton uploadInfo={uploadInfo} />{' '}
                        <Button
                          key={'download'}
                          variant={'contained'}
                          onClick={() => {
                            const filename = uploadInfo.encryptionKeyLocation
                              ? `enc-${uploadInfo.filename}`
                              : uploadInfo.filename;
                            saveAs(downloadLink(uploadInfo.uploadId), filename);
                          }}
                        >
                          download
                        </Button>
                      </div>
                    }
                  />
                </TableBody>
              </Table>
            </TableContainer>
          );
        } catch (e) {
          return <StatusMessageElement statusMessage={errorMessage('Could not read upload info', e)} />;
        }
      }
      return <></>;
    }
  },
  {
    name: 'debug',
    uiType: ({ cx }) => (
      <Stack sx={{ maxWidth: '40em', overflow: 'auto' }}>
        <pre>{JSON.stringify(cx?.locationUri, null, ' ')}</pre>
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
    const data = toPRecord(artwork);
    setData(data);
  }, [artwork]);

  const attributeDefs = attDefs.map((e) => ({ ...e, editable }));

  return <AttributeTableUi attributeDefs={attributeDefs} setData={setData} data={data || {}} />;
};
