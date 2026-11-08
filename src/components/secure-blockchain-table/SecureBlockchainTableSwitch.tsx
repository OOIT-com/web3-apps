import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import { NotifyFun } from '../../types';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { SecureBlockchainTableEditorUi } from './SecureBlockchainTableEditorUi';
import { SBTApp } from './salary-manager-app/SBTApp';
import { SBTManagerData } from './SecureBlockchainTableUi';
import { errorMessage, infoMessage, isStatusMessage, StatusMessage } from '../../shared/status-message';
import { SBTMetaData } from './sbt-types';

export const SecureBlockchainTableSwitch: FC<{ sbtManagerData: SBTManagerData; done: NotifyFun }> = ({
  sbtManagerData,
  done
}) => {
  const [metaData, setMetaData] = useState<string | SBTMetaData>('');
  const [statusMessage, setStatusMessage] = useState<StatusMessage | undefined>(infoMessage('Initialize...'));

  useEffect(() => {
    const sbtManager = sbtManagerData.sbtManager;
    setStatusMessage(infoMessage('Loading...'));
    sbtManager
      .getMetaData()
      .then((res) => {
        if (isStatusMessage(res)) {
          setStatusMessage(res);
        } else {
          try {
            setMetaData(JSON.parse(res));
          } catch (e) {
            setMetaData(res);
          }
        }
        setStatusMessage(undefined);
      })
      .catch((err) => {
        setStatusMessage(errorMessage(err));
      });
  }, [sbtManagerData]);

  if (statusMessage) {
    return <StatusMessageElement key={'loading'} statusMessage={statusMessage} />;
  }

  if (sbtManagerData.mode === 'edit') {
    return <SecureBlockchainTableEditorUi sbtManager={sbtManagerData.sbtManager} done={done} />;
  }

  if (typeof metaData === 'string') {
    return <SBTApp sbtManager={sbtManagerData.sbtManager} done={done} />;
  } else if (metaData.type === 'address') {
    return <div>ADDRESS</div>;
  } else {
    return <div>metadata is object!!!!</div>;
  }

  // specific salary manager app
};
