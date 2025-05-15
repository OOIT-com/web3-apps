import { StatusMessageElement } from './StatusMessageElement';

import {warningMessage} from "../../utils/status-message";

export const NoContract = ({ name }: { name: string }) => (
  <StatusMessageElement statusMessage={warningMessage(`No contract found for ${name}!`)} />
);
