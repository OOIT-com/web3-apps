import { SBTManager } from '../../contracts/secure-blockchain-table/SecureBlockchainTable-support';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Stack } from '@mui/material';
import { StatusMessageElement } from '../common/StatusMessageElement';
import Button from '@mui/material/Button';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import { useAppContext } from '../AppContextProvider';
import {isStatusMessage, StatusMessage, successMessage, warningMessage} from "../../utils/status-message";

export function SetEditablePart({
  sbtManager,
  editable,
  setEditable,
  isOwner
}: Readonly<{
  sbtManager: SBTManager;
  editable: boolean;
  setEditable: (editable: boolean) => void;
  isOwner: boolean;
}>) {
  const { wrap } = useAppContext();
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();

  const refreshData = useCallback(() => {
    wrap(`Reading Editable...`, async () => {
      const data = await sbtManager.isEditable();
      if (isStatusMessage(data)) {
        setStatusMessage(data);
      } else {
        setEditable(data);
      }
    }).catch(console.error);
  }, [wrap, sbtManager, setEditable]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const content = (
    <Stack spacing={2} direction={'row'}>
      <StatusMessageElement
        statusMessage={
          editable ? successMessage('This contract is editable') : warningMessage('This contract is not editable')
        }
      />

      <Button
        disabled={!isOwner}
        key={'toggle-editable'}
        onClick={() =>
          wrap(`Change editable...`, async () => {
            const res = await sbtManager.setEditable(!editable);
            if (isStatusMessage(res)) {
              setStatusMessage(res);
            } else {
              refreshData();
            }
          }).catch(console.error)
        }
      >
        Toggle Editable
      </Button>
      <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />
    </Stack>
  );

  return <CollapsiblePanel collapsed={true} title={`Editable`} toolbar={[]} content={content} />;
}
