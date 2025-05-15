import { NotifyFun } from '../../types';
import { useState } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { Button, Stack, TextField } from '@mui/material';
import { isAddress } from 'ethers';
import { displayAddress } from '../../utils/misc-util';
import { AddressData, getAddressBook } from '../../contracts/address-book/AddressBook-support';
import { LDBox } from '../common/StyledBoxes';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { useAppContext } from '../AppContextProvider';
import {infoMessage, isStatusMessage, StatusMessage, warningMessage} from "../../utils/status-message";

export function AddressDataRetrieveDialog({
  done,
  openForEdit
}: Readonly<{
  done: NotifyFun;
  openForEdit?: (addressData: AddressData) => void;
}>) {
  const { wrap } = useAppContext();
  const [retrieveValue, setRetrieveValue] = useState('');
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [addressData, setAddressData] = useState<AddressData>();
  const addressBook = getAddressBook();

  if (!addressBook) {
    return <></>;
  }

  return (
    <Dialog open={true} onClose={() => done()} maxWidth={'md'}>
      <DialogTitle>Retrieve By Name or Address</DialogTitle>
      <DialogContent>
        <Stack spacing={1}>
          <StatusMessageElement statusMessage={statusMessage} />
          <LDBox sx={{ fontSize: '90%', fontStyle: 'italic' }}>The retrieval does not support wildcards.</LDBox>
          <Stack direction={'row'} spacing={2} sx={{ width: '30em', padding: '1em 0' }}>
            <TextField
              key={'resolveValue'}
              label={'Get by Name or Address'}
              size={'small'}
              fullWidth={true}
              value={retrieveValue}
              onChange={(e) => setRetrieveValue(e.target.value)}
            />
          </Stack>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
            <Button
              key={'retrieve'}
              onClick={() =>
                wrap(
                  `Retrieve by ${isAddress(retrieveValue) ? 'Address' : 'Name'} for : ${retrieveValue}`,
                  async () => {
                    let entry: AddressData | StatusMessage;
                    if (isAddress(retrieveValue)) {
                      entry = await addressBook.getByAddress(retrieveValue);
                    } else {
                      entry = await addressBook.getByName(retrieveValue);
                    }
                    if (isStatusMessage(entry)) {
                      setStatusMessage(entry);
                    } else if (entry.name) {
                      setStatusMessage(infoMessage(`Found ${entry.name} (${displayAddress(entry.userAddress)})`));
                      setAddressData(entry);
                    } else {
                      setStatusMessage(
                        warningMessage(`No entry found by this ${isAddress(retrieveValue) ? 'Address' : 'Name'}`)
                      );
                    }
                  }
                )
              }
            >
              Retrieve
            </Button>
            <Button key={'close'} onClick={() => done()}>
              Close
            </Button>
            {openForEdit && addressData && (
              <Button key={'open-for-edit'} onClick={() => openForEdit(addressData)}>
                Open for Edit
              </Button>
            )}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
