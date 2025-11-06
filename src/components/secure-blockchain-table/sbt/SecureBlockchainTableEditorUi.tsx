import { Stack } from '@mui/material';
import { SBTManager } from '../../../contracts/secure-blockchain-table/SecureBlockchainTable-support';
import { CollapsiblePanel } from '../../common/CollapsiblePanel';
import Button from '@mui/material/Button';
import * as React from 'react';
import { FC, useCallback, useEffect, useState } from 'react';
import { NotifyRefresh } from '../../../types';
import { StatusMessageElement } from '../../common/StatusMessageElement';
import { RowDataWithVersionsPart } from '../RowDataWithVersionsPart';
import { SetEditablePart } from '../SetEditablePart';
import { DataPart } from '../../common/DataPart';
import { SBTUserManagement } from '../SBTUserManagement';
import { useAppContext } from '../../AppContextProvider';
import { isStatusMessage, StatusMessage } from '../../../utils/status-message';

export const SecureBlockchainTableEditorUi: FC<{
  sbtManager: SBTManager;
  done: NotifyRefresh;
}> = ({ sbtManager, done }) => {
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

  const setMetaDataFun = useCallback((data: string) => sbtManager.setMetaData(data), [sbtManager]);
  const getMetaDataFun = useCallback(() => sbtManager.getMetaData(), [sbtManager]);
  const setInitialDataFun = useCallback(
    async (data: string) => {
      const encData = await sbtManager.encryptContent(data);
      if (isStatusMessage(encData)) {
        return encData;
      } else {
        await sbtManager.setInitialData(encData);
      }
    },
    [sbtManager]
  );
  const getInitialDataFun = useCallback(async () => {
    const encData = await sbtManager.getInitialData();
    if (isStatusMessage(encData)) {
      return encData;
    } else {
      return await sbtManager.decryptEncContent(encData);
    }
  }, [sbtManager]);
  return (
    <CollapsiblePanel
      collapsible={false}
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
          {isOwner && <SBTUserManagement sbtManager={sbtManager} editable={isOwner} />}
          <SetEditablePart sbtManager={sbtManager} editable={editable} setEditable={setEditable} isOwner={isOwner} />

          <DataPart
            key={'initial-data'}
            editable={isOwner}
            label={'Initial Data'}
            setFun={setInitialDataFun}
            getFun={getInitialDataFun}
          />
          <DataPart
            editable={isOwner}
            key={'data-definition'}
            label={'Data Definition'}
            setFun={setMetaDataFun}
            getFun={getMetaDataFun}
          />
          <RowDataWithVersionsPart sbtManager={sbtManager} editable={editable} />
        </Stack>
      }
    />
  );
};
