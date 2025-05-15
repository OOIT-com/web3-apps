import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { SnackbarMessage, Web3Session } from '../types';
import { AddressData, AddressDataWithIndex } from '../contracts/address-book/AddressBook-support';
import { errorMessage, infoMessage, StatusMessage } from '../utils/status-message';

let SnackbarMessageCounter = 0;
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
export type WrapFun = <R>(loading: string, p: () => Promise<R>) => Promise<R | StatusMessage>;
export type SetWeb3Session = (w?: Web3Session) => void;
export type SetAddressData = (a?: AddressData[]) => void;

export type AppContextData = {
  loading: string;
  setLoading: (value: string) => void;

  wrap: WrapFun;

  snackbarMessage?: SnackbarMessage;
  setSnackbarMessage: (value: SnackbarMessage) => void;
  dispatchSnackbarMessage: (statusMessage: StatusMessage | string | undefined, duration?: number) => void;
  web3Session?: Web3Session;
  setWeb3Session: SetWeb3Session;
  //
  addressData?: AddressDataWithIndex[];
  setAddressData: SetAddressData;
};

const defaultValue: AppContextData = {
  loading: '',
  setLoading: noop as never,
  wrap: noop as never,
  setSnackbarMessage: noop as never,
  dispatchSnackbarMessage: noop as never,
  setWeb3Session: noop as never,
  setAddressData: noop as never
};

export const AppContext = createContext<AppContextData | undefined>(undefined);

export function AppContextProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [loading, setLoading] = useState('');
  const [web3Session, setWeb3Session] = useState<Web3Session>();
  const [snackbarMessage, setSnackbarMessage] = useState<SnackbarMessage>();
  const [addressData, setAddressData] = useState<AddressData[]>();

  const wrap = useCallback(
    async function w<P = void>(loading: string, p: () => Promise<P>): Promise<P | StatusMessage> {
      try {
        setLoading(loading);
        return await p();
      } catch (e) {
        return errorMessage('Error occurred', e);
      } finally {
        setLoading('');
      }
    },
    [setLoading]
  );

  const dispatchSnackbarMessage = useCallback(
    (statusMessage: StatusMessage | string | undefined, duration = 3000) => {
      if (!statusMessage) {
        return;
      }
      if (typeof statusMessage === 'string') {
        statusMessage = infoMessage(statusMessage);
      }
      SnackbarMessageCounter++;
      const snackbarMessage: SnackbarMessage = { ...statusMessage, duration, counter: SnackbarMessageCounter };

      setSnackbarMessage(snackbarMessage);
    },
    [setSnackbarMessage]
  );

  const value: AppContextData = useMemo(
    () => ({
      loading,
      setLoading,

      wrap,

      snackbarMessage,
      setSnackbarMessage,
      dispatchSnackbarMessage,
      web3Session,
      setWeb3Session,
      //
      addressData,
      setAddressData
    }),
    [
      loading,
      setLoading,
      wrap,
      snackbarMessage,
      setSnackbarMessage,
      dispatchSnackbarMessage,
      web3Session,
      setWeb3Session,
      addressData,
      setAddressData
    ]
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextData {
  return useContext(AppContext) || defaultValue;
}
