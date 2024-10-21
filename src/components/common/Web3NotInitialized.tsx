import { StatusMessage, warningMessage } from '../../types';
import { StatusMessageElement } from './StatusMessageElement';
import * as React from 'react';
import { FC } from 'react';

export const web3NotInitialized: StatusMessage = warningMessage('Web3 is not initialized!');
export const Web3NotInitialized: FC = () => <StatusMessageElement statusMessage={web3NotInitialized} />;
