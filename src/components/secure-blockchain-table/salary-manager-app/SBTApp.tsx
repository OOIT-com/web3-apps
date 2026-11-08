import { Stack } from '@mui/material';
import { SBTManager } from '../../../contracts/secure-blockchain-table/SecureBlockchainTable-support';
import { CollapsiblePanel } from '../../common/CollapsiblePanel';
import { SalaryManagerInitialDataPanel } from './SalaryManagerInitialDataPanel';
import * as React from 'react';
import { ReactNode, useEffect, useState } from 'react';
import { NotifyFun } from '../../../types';
import { StatusMessageElement } from '../../common/StatusMessageElement';
import { SalaryManagerDataRowsEditor } from './SalaryManagerDataRowsEditor';
import { SMTableMode } from './sm-table/types';
import Button from '@mui/material/Button';
import { isStatusMessage, StatusMessage } from '../../../shared/status-message';

export function SBTApp({ sbtManager, done }: Readonly<{ sbtManager: SBTManager; done: NotifyFun }>) {
  const [isOwner, setIsOwner] = useState(false);
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [initialData, setInitialData] = useState('');
  const [mode, setMode] = useState<SMTableMode>('readonly');

  useEffect(() => {
    sbtManager.refreshEditable();
  }, [sbtManager]);

  useEffect(() => {
    setMode(sbtManager.editable ? 'editable' : 'readonly');
  }, [sbtManager.editable]);

  useEffect(() => {
    sbtManager.isOwner().then((res) => {
      if (isStatusMessage(res)) {
        setStatusMessage(res);
      } else {
        setIsOwner(res);
      }
    });
  }, [sbtManager]);

  const content: ReactNode[] = [
    <StatusMessageElement
      key={'status-message'}
      statusMessage={statusMessage}
      onClose={() => setStatusMessage(undefined)}
    />,
    <SalaryManagerInitialDataPanel
      key={'initial-data-part'}
      readonly={!isOwner}
      sbtManager={sbtManager}
      initialData={initialData}
      setInitialData={setInitialData}
    />
  ];

  // if (metaData && typeof metaData === 'object') {
  //   if (metaData.type === 'address') {
  //     content.push(<Box id={'address-box'}>Welcome to the address box....</Box>);
  //   } else if (initialData) {
  //     content.push(
  //       <GenDataRowsEditor
  //         key={'gen-data-rows-editor'}
  //         sbtManager={sbtManager}
  //         metaData={metaData}
  //         initialData={initialData}
  //         mode={mode}
  //       />
  //     );
  //   }
  // }

  if (initialData) {
    content.push(
      <SalaryManagerDataRowsEditor key={'table-editor'} sbtManager={sbtManager} initialData={initialData} mode={mode} />
    );
  }

  return (
    <CollapsiblePanel
      key={'top1'}
      level={'top'}
      title={'Salary Manager App'}
      content={content}
      toolbar={
        <Stack>
          <Button key={'close'} onClick={() => done()}>
            Close
          </Button>
        </Stack>
      }
    />
  );
}
