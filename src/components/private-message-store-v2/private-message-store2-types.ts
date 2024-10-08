import { GetInBoxResult } from '../../contracts/private-message-store/PrivateMessageStore-support';

export type Message = GetInBoxResult & { subject?: string; text?: string; displayText?: boolean };
