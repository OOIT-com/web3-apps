import {errorMessage} from "./status-message";

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
