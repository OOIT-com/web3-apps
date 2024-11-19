import { NotifyRefresh, StatusMessage, warningMessage } from '../../types';
import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { Button, Stack, TextField } from '@mui/material';
import moment from 'moment/moment';
import {
  AddressDataWithIndex,
  getAddressBook,
  newAddressDataTemplate
} from '../../contracts/address-book/AddressBook-support';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { resolveAsStatusMessage } from '../../utils/status-message-utils';
import { useAppContext } from '../AppContextProvider';

export function AddressDataEditDialog({
  done,
  addressDataIn
}: {
  readonly done: NotifyRefresh;
  readonly addressDataIn: AddressDataWithIndex | 'new';
}) {
  const { wrap, web3Session, dispatchSnackbarMessage } = useAppContext();
  const { publicAddress } = web3Session || {};
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [addressData, setAddressData] = useState(addressDataIn !== 'new' ? addressDataIn : newAddressDataTemplate(''));
  const setCd = (name: string, value: string) => {
    setAddressData((cd) => ({ ...cd, [name]: value }));
  };
  const { userAddress, name, description, phone, email, name1, name2, name3, status, created, updated, index } =
    addressData;

  const isUpdate = addressDataIn !== 'new';
  let title = 'New Address';
  if (isUpdate) {
    title = `Address ${index === undefined ? '' : 'Nr ' + (index + 1)}`;
  }

  const addressBook = getAddressBook();
  if (!publicAddress || !addressBook) {
    return <></>;
  }
  return (
    <Dialog open={true} onClose={() => done(false)} maxWidth={'md'}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />
        <Stack spacing={2} sx={{ width: '30em', padding: '1em 0' }}>
          <TextField
            disabled={isUpdate}
            key={'userAddress'}
            label={'User Address*'}
            size={'small'}
            fullWidth={true}
            value={userAddress}
            onChange={(e) => setCd('userAddress', e.target.value)}
          />
          <AttributeRow key={'name'} value={name} label={'Name*'} change={(value) => setCd('name', value)} />
          <AttributeRow
            key={'description'}
            value={description}
            label={'Description'}
            change={(value) => setCd('description', value)}
            minRows={3}
          />{' '}
          <AttributeRow key={'email'} value={email} label={'Email'} change={(value) => setCd('email', value)} />
          <AttributeRow key={'phone'} value={phone} label={'Phone'} change={(value) => setCd('phone', value)} />{' '}
          <AttributeRow key={'name1'} value={name1} label={'Name 1'} change={(value) => setCd('name1', value)} />
          <AttributeRow key={'name2'} value={name2} label={'Name 2'} change={(value) => setCd('name2', value)} />
          <AttributeRow key={'name3'} value={name3} label={'Name 3'} change={(value) => setCd('name3', value)} />
          {isUpdate && (
            <TextField
              key={'status'}
              label={'Status'}
              size={'small'}
              fullWidth={true}
              value={status}
              onChange={(e) => setCd('status', e.target.value)}
            />
          )}
          {isUpdate && (
            <TextField
              disabled={true}
              key={'created'}
              label={'Created'}
              size={'small'}
              fullWidth={true}
              value={created ? moment(1000 * +created.toString()).format('YYYY-MM-DD HH:mm') : ''}
            />
          )}
          {isUpdate && (
            <TextField
              disabled={true}
              key={'updated'}
              label={'Updated'}
              size={'small'}
              fullWidth={true}
              value={updated ? moment(1000 * +updated.toString()).format('YYYY-MM-DD HH:mm') : ''}
            />
          )}
        </Stack>
        <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
          {isUpdate ? (
            <Button
              key={'update'}
              onClick={() =>
                wrap(`Update ${name} ...`, () => addressBook.update(addressData, publicAddress))
                  .then((res) => {
                    if (res.status === 'success') {
                      done(true);
                      dispatchSnackbarMessage(warningMessage('Update may take a couple of second!'));
                    } else {
                      setStatusMessage(res);
                    }
                  })
                  .catch(console.error)
              }
              disabled={!name || !userAddress}
            >
              Update
            </Button>
          ) : (
            <Button
              key={'add'}
              onClick={() =>
                wrap(`Add ${name} ...`, () => {
                  setStatusMessage(undefined);
                  return addressBook.add(addressData, publicAddress);
                })
                  .then((res) => {
                    if (res.status === 'success') {
                      done(true);
                      dispatchSnackbarMessage(warningMessage('Add may take a couple of second!'));
                    } else {
                      setStatusMessage(res);
                    }
                  })
                  .catch((e: Error) => setStatusMessage(resolveAsStatusMessage('Error occurred', e)))
              }
              disabled={!name || !userAddress}
            >
              Add
            </Button>
          )}
          <Button key={'close'} onClick={() => done(false)}>
            Close
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function AttributeRow({
  value,
  label,
  change,
  minRows = 1
}: Readonly<{
  value: string;
  label: string;
  change: (value: string) => void;
  minRows?: number;
}>) {
  return (
    <TextField
      label={label}
      size={'small'}
      fullWidth={true}
      value={value}
      onChange={(e) => change(e.target.value)}
      rows={minRows}
      multiline={minRows > 1}
    />
  );
}
