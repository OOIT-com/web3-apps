import { GetInBoxResult, GetOutBoxResult } from '../../contracts/private-message-store/PrivateMessageStoreV2-support';

export type Message = GetInBoxResult & { subject?: string; text?: string; displayText?: boolean };

export type OutMessage = GetOutBoxResult & { subject?: string; text?: string; displayText?: boolean };
export type SetOutMessages = (setMessage: (messages: OutMessage[]) => OutMessage[]) => void;

export const isOutMessage = (m: Message | OutMessage): m is OutMessage => {
  return (m as OutMessage).receiver !== undefined;
};
export type DecryptedData = { text: string; displayText: boolean };
export type DecryptedDataList = (DecryptedData | undefined)[];
export type SetDecryptedDataList = (set: (d: DecryptedDataList) => DecryptedDataList) => void;
