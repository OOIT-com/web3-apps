export function isError(e: any): e is Error {
  return e?.message;
}

export declare type StatusMessageStatus = 'success' | 'info' | 'warning' | 'error';
export declare type StatusMessage = {
  status: StatusMessageStatus;
  userMessage?: string;
  systemMessage?: string;
  additionalSystemMessages?: string[];
};
export const errorMessage = (userMessage: string, error: Error | string | unknown = ''): StatusMessage => {
  const status = 'error';
  let systemMessage;
  if (!error) {
    systemMessage = '';
  } else if (isError(error)) {
    systemMessage = error.message;
  } else if (typeof error === 'string') {
    systemMessage = error;
  } else {
    systemMessage = error.toString();
  }
  return {
    status,
    userMessage,
    systemMessage
  };
};
export const warningMessage = (userMessage: string): StatusMessage => ({
  status: 'warning',
  userMessage: userMessage
});
export const infoMessage = (userMessage: string): StatusMessage => ({
  status: 'info',
  userMessage: userMessage
});
export const successMessage = (userMessage: string): StatusMessage => ({
  status: 'success',
  userMessage: userMessage
});
export const isStatusMessage = (arg: any): arg is StatusMessage =>
  !!(arg && typeof arg === 'object' && arg.status && arg.userMessage);
