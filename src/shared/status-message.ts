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
export function resolveAsStatusMessage(message: string, e: any) {
  let m = '';
  if (e && typeof e === 'object') {
    if (e.error) {
      e = e.error;
    }
    if (e.reason) {
      m = e.reason;
    } else if (e.data?.message) {
      m = e.data?.message;
    } else if (e.message) {
      m = e.message;
    }
  }
  return errorMessage(`${message}: ${m}`, e);
}
