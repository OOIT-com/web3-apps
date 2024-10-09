import { GetInBoxResult } from '../../contracts/private-message-store/PrivateMessageStoreV2-support';

export type Message = GetInBoxResult & { subject?: string; text?: string; displayText?: boolean };
