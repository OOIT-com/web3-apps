import { StatusMessageElement } from './StatusMessageElement';
import { warningMessage } from '../../types';

export const NoContract = ({ name }: { name: string }) => (
  <StatusMessageElement statusMessage={warningMessage(`No contract found for ${name}!`)} />
);
