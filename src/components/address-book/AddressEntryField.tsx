import TextField from '@mui/material/TextField';
import { Autocomplete, Box } from '@mui/material';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { addressDataDisplay } from './address-book-utils';
import { AddressBoxWithCopy } from '../common/AddressBoxWithCopy';
import { useAppContext } from '../AppContextProvider';

export function AddressEntryField({
  disabled = false,
  label,
  setAddress,
  address
}: Readonly<{
  disabled?: boolean;
  label?: string;
  address: string;
  setAddress: (address: string) => void;
}>) {
  const { addressData = [] } = useAppContext();
  const [addressContent, setAddressContent] = useState('');
  useEffect(() => {
    const index = addressData.findIndex((e) => addressDataDisplay(e) === addressContent);
    setAddress(index === -1 ? addressContent : addressData[index].userAddress);
  }, [setAddress, addressContent, addressData]);
  return (
    <Autocomplete
      fullWidth={true}
      disabled={disabled}
      onChange={(_, newValue) => {
        setAddressContent((newValue as string) ?? '');
      }}
      onInputChange={(_, newInputValue) => {
        setAddressContent(newInputValue || '');
      }}
      freeSolo
      options={addressData.map((e) => addressDataDisplay(e))}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          margin="dense"
          label={label ?? 'Address'}
          helperText={
            <Box component={'span'} sx={{ color: 'black', fontStyle: 'italic', fontWeight: '800' }}>
              <AddressBoxWithCopy value={address} variant={'standard'} />
            </Box>
          }
        />
      )}
    />
  );
}
