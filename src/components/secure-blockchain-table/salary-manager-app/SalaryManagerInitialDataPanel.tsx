import { SBTManager } from '../../../contracts/secure-blockchain-table/SecureBlockchainTable-support';
import { useAppContext } from '../../AppContextProvider';
import { useCallback, useEffect, useState } from 'react';
import { Button, Tooltip } from '@mui/material';
import { InitialData } from './types';
import { infoMessage, isStatusMessage, StatusMessage, successMessage } from '../../../types';
import { CollapsiblePanel } from '../../common/CollapsiblePanel';
import { StatusMessageElement } from '../../common/StatusMessageElement';
import { InitialDataDisplay } from './InitialDataDisplay';
import { getInitialDataFromContract, saveInitialData } from './sm-app-utils';
import { InititalDataUploaderButton } from './InititalDataUploaderButton';

export function SalaryManagerInitialDataPanel({
  readonly,
  sbtManager,
  initialData,
  setInitialData
}: Readonly<{
  readonly: boolean;
  sbtManager: SBTManager;
  initialData?: InitialData;
  setInitialData: (initialData: InitialData) => void;
}>) {
  const { wrap } = useAppContext();
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();

  const loadInitialData = useCallback(async () => {
    setStatusMessage(undefined);
    const initialData0 = await getInitialDataFromContract(wrap, sbtManager);
    if (isStatusMessage(initialData0)) {
      setStatusMessage(initialData0);
    } else {
      setInitialData(initialData0);
    }
  }, [wrap, sbtManager, setInitialData]);

  useEffect(() => {
    loadInitialData();
  }, [setInitialData, loadInitialData]);

  useEffect(() => {
    if (readonly) {
      setStatusMessage(
        initialData ? successMessage('Initial Data Loaded!') : infoMessage('Initial Data not yet loaded!')
      );
    }
  }, [readonly, initialData]);

  if (readonly) {
    return <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />;
  }

  return (
    <CollapsiblePanel
      key={'initial-data'}
      level={'second'}
      title={'Initial Data'}
      collapsible={true}
      collapsed={true}
      toolbar={[
        <Tooltip key={'load-data'} title={'Reload Initial Data from current contract.'}>
          <Button onClick={() => loadInitialData()}>Re-Load Initial Data</Button>
        </Tooltip>,
        <InititalDataUploaderButton
          key={'initial-data-excel-uploader'}
          setUploadResult={(res: StatusMessage | InitialData) =>
            isStatusMessage(res) ? setStatusMessage(res) : setInitialData(res)
          }
        />,
        <Button
          disabled={!initialData}
          key={'save-initial-data'}
          onClick={async () => {
            setStatusMessage(undefined);
            if (initialData) {
              const res = await saveInitialData(wrap, sbtManager, initialData);
              if (isStatusMessage(res)) {
                setStatusMessage(res);
              }
            }
          }}
        >
          Save Initial Data
        </Button>
      ]}
      content={[
        <InitialDataDisplay key={'initial-data-display'} initialData={initialData} />,
        <StatusMessageElement
          key={'status-message'}
          statusMessage={statusMessage}
          onClose={() => setStatusMessage(undefined)}
        />
      ]}
    ></CollapsiblePanel>
  );
}
