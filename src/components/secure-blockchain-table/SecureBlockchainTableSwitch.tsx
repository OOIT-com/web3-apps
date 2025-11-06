import * as React from 'react';
import { FC } from 'react';
import { NotifyFun } from '../../types';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { SecureBlockchainTableEditorUi } from './sbt/SecureBlockchainTableEditorUi';
import { SBTApp } from './salary-manager-app/SBTApp';
import { SBTManagerData } from './SecureBlockchainTableUi';
import { infoMessage } from '../../utils/status-message';

export const SecureBlockchainTableSwitch: FC<{ sbtManagerData?: SBTManagerData; done: NotifyFun }> = ({
  sbtManagerData,
  done
}) => {
  if (!sbtManagerData) {
    return <StatusMessageElement statusMessage={infoMessage('No SBT Manager Data available!')} />;
  }

  if (sbtManagerData.mode === 'edit') {
    return <SecureBlockchainTableEditorUi sbtManager={sbtManagerData.sbtManager} done={done} />;
  }

  // specific salary manager app
  return <SBTApp sbtManager={sbtManagerData.sbtManager} done={done} />;
};
