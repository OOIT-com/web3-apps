import { StatusMessageElement } from './StatusMessageElement';
import * as React from 'react';
import { FC } from 'react';
import {StatusMessage, warningMessage} from "../../utils/status-message";

export const web3NotInitialized: StatusMessage = warningMessage('Web3 is not initialized!');
export const Web3NotInitialized: FC = () => <StatusMessageElement statusMessage={web3NotInitialized} />;
