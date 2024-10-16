import TextField from '@mui/material/TextField';
import { Autocomplete, FormHelperText } from '@mui/material';
import * as React from 'react';
import { FC } from 'react';
import { addressDataDisplay } from './address-book-utils';
import { AddressBoxWithCopy } from '../common/AddressBoxWithCopy';
import { useAppContext } from '../AppContextProvider';

export const AddressEntryField: FC<{
  disabled?: boolean;
  label?: string;
  address: string;
  setAddress: (address: string) => void;
}> = ({ disabled = false, label, setAddress, address }) => {
  const { addressData = [] } = useAppContext();
  //const [addressContent, setAddressContent] = useState('');
  // useEffect(() => {
  //   const index = addressData.findIndex((e) => addressDataDisplay(e) === addressContent);
  //   setAddress(index === -1 ? addressContent : addressData[index].userAddress);
  // }, [setAddress, addressContent, addressData]);

  console.debug(`Rendering AddressEntryField: ${address}`);

  return (
    <Autocomplete
      fullWidth={true}
      disabled={disabled}
      // onChange={(_, newValue) => {
      //   setAddressContent((newValue as string) ?? '');
      // }}
      onInputChange={(_, newInputValue) => {
        const addressContent = newInputValue || '';
        //setAddressContent(addressContent);
        const index = addressData.findIndex((e) => addressDataDisplay(e) === addressContent);
        const a = index === -1 ? addressContent : addressData[index].userAddress;
        setAddress(a);
        console.debug(`Rendering onInputChange ${a}`);
      }}
      freeSolo
      options={addressData.map((e) => addressDataDisplay(e))}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          margin="dense"
          size={'small'}
          label={label ?? 'Address'}
          helperText={
            <FormHelperText component={'div'} sx={{ color: 'black', fontStyle: 'italic', fontWeight: '800' }}>
              <AddressBoxWithCopy value={address} variant={'standard'} />
            </FormHelperText>
          }
        />
      )}
    />
  );
};
