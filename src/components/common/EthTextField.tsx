import * as React from 'react';
import { FC } from 'react';
import { InputAdornment, TextFieldProps } from '@mui/material';
import TextField from '@mui/material/TextField';
import { useAppContext } from '../AppContextProvider';
import { Web3NotInitialized } from './Web3NotInitialized';
import { getNetworkInfo } from '../../network-info';

export const EthTextField: FC<TextFieldProps> = (props) => {
  const { web3Session } = useAppContext();
  const { chainId } = web3Session || {};

  if (!chainId) {
    return <Web3NotInitialized />;
  }
  const { currencySymbol } = getNetworkInfo(chainId);
  return (
    <TextField
      value={props.value}
      onChange={
        //(e: ChangeEvent<HTMLInputElement>) => props.setAmountEth(e.target.value || '')
        props.onChange
      }
      {...props}
      autoFocus
      fullWidth
      slotProps={{
        input: {
          startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>
        }
      }}
    />
  );
};
