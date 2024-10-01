import { isStatusMessage, StatusMessage } from '../../types';
import * as React from 'react';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import { Stack, TextField } from '@mui/material';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import { useAppContext } from '../AppContextProvider';

export function DataPart({
  editable,
  setFun,
  getFun,
  label
}: Readonly<{
  editable: boolean;
  label: string;
  setFun: (data: string) => Promise<StatusMessage | undefined>;
  getFun: () => Promise<StatusMessage | string>;
}>) {
  const { wrap } = useAppContext();
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [data, setData] = useState('');

  const refreshData = useCallback(() => {
    wrap(`Reading ${label}...`, async () => {
      const data = await getFun();
      if (isStatusMessage(data)) {
        setStatusMessage(data);
      } else {
        setData(data);
      }
    }).catch(console.error);
  }, [wrap, getFun, label]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const toolbar: ReactNode[] = [];
  if (editable) {
    toolbar.push(
      <Button
        key={'save'}
        onClick={() =>
          wrap(`Save ${label}`, async () => {
            const res = await setFun(data);
            setStatusMessage(res);
          })
        }
      >
        Save
      </Button>
    );
  }
  toolbar.push(
    <Button key={'refresh'} onClick={refreshData}>
      Refresh
    </Button>
  );

  const content = (
    <Stack>
      <TextField
        disabled={!editable}
        multiline={true}
        maxRows={6}
        label={label}
        onChange={(e) => setData(e.target.value)}
        value={data}
      ></TextField>{' '}
      <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />
    </Stack>
  );

  return <CollapsiblePanel title={`${label}`} toolbar={toolbar} content={content} />;
}
