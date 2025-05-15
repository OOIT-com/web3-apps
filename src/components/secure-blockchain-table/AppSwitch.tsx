import * as React from 'react';
import { FC } from 'react';
import { NotifyFun } from '../../types';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { SBTEditorUi } from './sbt/SBTEditorUi';
import { SBTApp } from './salary-manager-app/SBTApp';
import { SalaryManagerTabConfig } from './SecureBlockchainTableUi';
import {infoMessage} from "../../utils/status-message";

export const AppSwitch: FC<{ config?: SalaryManagerTabConfig; done: NotifyFun }> = ({ config, done }) => {
  if (!config) {
    return <StatusMessageElement statusMessage={infoMessage('No Salary Manager selected!')} />;
  }

  if (config.mode === 'edit') {
    return <SBTEditorUi sbtManager={config.sbtManager} done={done} />;
  }

  return <SBTApp sbtManager={config.sbtManager} done={done} />;
};
