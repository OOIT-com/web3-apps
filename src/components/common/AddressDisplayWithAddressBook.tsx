import Button from '@mui/material/Button';
import { useState } from 'react';
import { useAppContext } from '../AppContextProvider';

export function AddressDisplayWithAddressBook({ address }: Readonly<{ address: string }>) {
  const { addressData = [] } = useAppContext();
  const [toggle, setToggle] = useState(false);

  return (
    <Button onClick={() => setToggle((t) => !t)}>
      {toggle
        ? address.toLowerCase()
        : addressData.find((e) => e.userAddress === address.toLowerCase())?.name ?? address.toLowerCase()}
    </Button>
  );
}
