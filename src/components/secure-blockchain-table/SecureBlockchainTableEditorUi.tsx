import { Stack } from '@mui/material';
import { SBTManager } from '../../contracts/secure-blockchain-table/SecureBlockchainTable-support';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import Button from '@mui/material/Button';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { isStatusMessage, NotifyRefresh, StatusMessage } from '../../types';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { RowDataWithVersionsPart } from './RowDataWithVersionsPart';
import { SetEditablePart } from './SetEditablePart';
import { DataPart } from './DataPart';
import { UserManagement } from './UserManagement';
import { useAppContext } from '../AppContextProvider';

export function SecureBlockchainTableEditorUi({
  sbtManager,
  done
}: Readonly<{
  sbtManager: SBTManager;
  done: NotifyRefresh;
}>) {
  const { wrap } = useAppContext();
  const [editable, setEditable] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();

  useEffect(() => {
    wrap('Check Ownership...', async () => {
      const isOwner = await sbtManager.isOwner();
      if (isStatusMessage(isOwner)) {
        setStatusMessage(isOwner);
      } else {
        setIsOwner(isOwner);
      }
    });
  }, [wrap, sbtManager]);

  return (
    <CollapsiblePanel
      level={'top'}
      title={`Secure Blockchain Table: ${sbtManager.name}`}
      toolbar={
        <Stack>
          <Button key={'close'} onClick={() => done(false)}>
            Close
          </Button>
        </Stack>
      }
      content={
        <Stack spacing={1}>
          <StatusMessageElement statusMessage={statusMessage} />
          {isOwner && <UserManagement sbtManager={sbtManager} editable={isOwner} />}
          <SetEditablePart sbtManager={sbtManager} editable={editable} setEditable={setEditable} isOwner={isOwner} />
          <DataPart
            key={'initial-data'}
            editable={isOwner}
            label={'Initial Data'}
            setFun={async (data: string) => {
              const encData = await sbtManager.encryptContent(data);
              if (isStatusMessage(encData)) {
                return encData;
              } else {
                await sbtManager.setInitialData(encData);
              }
            }}
            getFun={async () => {
              const encData = await sbtManager.getInitialData();
              if (isStatusMessage(encData)) {
                return encData;
              } else {
                return await sbtManager.decryptEncContent(encData);
              }
            }}
          />
          <DataPart
            editable={isOwner}
            key={'data-definition'}
            label={'Data Definition'}
            setFun={(data: string) => sbtManager.setMetaData(data)}
            getFun={() => sbtManager.getMetaData()}
          />
          <RowDataWithVersionsPart sbtManager={sbtManager} editable={editable} />
        </Stack>
      }
    />
  );
}
