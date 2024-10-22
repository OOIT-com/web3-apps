import * as React from 'react';
import { FC } from 'react';
import { infoMessage, NotifyFun } from '../../types';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { SecureBlockchainTableEditorUi } from './sbt/SecureBlockchainTableEditorUi';
import { SalaryManagerApp } from './salary-manager-app/SalaryManagerApp';
import { SalaryManagerTabConfig } from './SalaryManagerUi';

export const AppSwitch: FC<{ config?: SalaryManagerTabConfig; done: NotifyFun }> = ({ config, done }) => {
  if (!config) {
    return <StatusMessageElement statusMessage={infoMessage('No Salary Manager selected!')} />;
  }

  if (config.mode === 'edit') {
    return <SecureBlockchainTableEditorUi sbtManager={config.sbtManager} done={done} />;
  }

  return <SalaryManagerApp sbtManager={config.sbtManager} done={done} />;
};
