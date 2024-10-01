import { warningMessage } from '../../types';
import { StatusMessageElement } from './StatusMessageElement';
import * as React from 'react';
import { FC } from 'react';

export const Web3NotInitialized: FC = () => (
  <StatusMessageElement statusMessage={warningMessage('Web3 is not initialized!')} />
);
