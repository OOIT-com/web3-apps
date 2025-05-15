import * as React from 'react';
import { FC } from 'react';
import { StatusMessageElement } from './StatusMessageElement';

import {warningMessage} from "../../utils/status-message";

export const NoContractFound: FC<{ name: string }> = ({ name }) => (
  <StatusMessageElement statusMessage={warningMessage(`No contract for ${name} found`)} />
);
