import { Stack } from '@mui/material';
import { SBTManager } from '../../contracts/secure-blockchain-table/SecureBlockchainTable-support';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import Button from '@mui/material/Button';
import * as React from 'react';
import { FC, useCallback, useEffect, useState } from 'react';
import { NotifyRefresh } from '../../types';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { RowDataWithVersionsPart } from './RowDataWithVersionsPart';
import { SetEditablePart } from './SetEditablePart';
import { DataPart } from '../common/DataPart';
import { SBTUserManagement } from './SBTUserManagement';
import { useAppContext } from '../AppContextProvider';
import { errorMessage, infoMessage, isStatusMessage, StatusMessage } from '../../shared/status-message';
import { displayAddress } from '../../utils/misc-util';

export const SecureBlockchainTableEditorUi: FC<{
  sbtManager: SBTManager;
  done: NotifyRefresh;
}> = ({ sbtManager, done }) => {
  const { wrap, loading, web3Session } = useAppContext();
  const [editable, setEditable] = useState(false);
  const [owner, setOwner] = useState('');
  const [hasEncSecretKey, setHasEncSecretKey] = useState(false);
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();

  useEffect(() => {
    wrap('Check Ownership...', async () => {
      const owner = await sbtManager.owb.owner();
      if (isStatusMessage(owner)) {
        setStatusMessage(owner);
      } else {
        setOwner(owner);
      }
      const myEncSecret = await sbtManager.getMyEncSecret();
      if (isStatusMessage(myEncSecret)) {
        setStatusMessage(myEncSecret);
      } else {
        setHasEncSecretKey(!!myEncSecret);
      }
    }).catch(console.error);
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

  useEffect(() => {
    console.debug(`loading <${loading}>`);
  }, [loading]);

  const isOwner = owner.toLowerCase() === web3Session?.publicAddress.toLowerCase();

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
      content={[
        loading ? <StatusMessageElement key={'loading'} statusMessage={infoMessage('Loading...')} /> : '',
        <Stack key={'main'} spacing={1}>
          <StatusMessageElement key={'status-message'} statusMessage={statusMessage} />
          {isOwner && <SBTUserManagement sbtManager={sbtManager} editable={isOwner} />}
          {hasEncSecretKey ? (
            <div key={'edit-parts'} style={{ display: loading ? 'none' : 'block' }}>
              <SetEditablePart
                sbtManager={sbtManager}
                editable={editable}
                setEditable={setEditable}
                isOwner={isOwner}
              />
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
            </div>
          ) : (
            <StatusMessageElement
              key={'no-access'}
              statusMessage={errorMessage(
                `You have no access to "${sbtManager.name}". Please, contact the owner ${displayAddress(owner)}!`
              )}
            />
          )}
        </Stack>
      ]}
    />
  );
};
