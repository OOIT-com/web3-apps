import { NotifyFun, StatusMessage } from '../../types';
import { useState } from 'react';
import { ContractData } from '../../contracts/contract-registry/ContractRegistry-support';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { Button, Stack } from '@mui/material';
import moment from 'moment/moment';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { TextFieldView } from '../common/TextFieldView';
import { OwnableWithBackup } from './ContractRegistryUi';
import { AddressBoxWithCopy } from '../common/AddressBoxWithCopy';
import { useAppContext } from '../AppContextProvider';

export function ContractEntryView({
  done,
  action,
  contractData
}: {
  readonly done: NotifyFun;
  readonly action: (command: string, index: number) => void;
  readonly contractData: ContractData;
}) {
  const app = useAppContext();
  const { web3Session } = app || {};
  const { publicAddress } = web3Session || {};
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();

  const {
    name,
    contractAddress,
    description,
    contractName,
    sourceCodeUrl,
    url,
    contractType,
    constructorArgs,
    status,
    created,
    updated,
    index
  } = contractData;

  const title = `Registered Contract ${index === undefined ? '' : 'Nr ' + (index + 1)}`;

  if (!publicAddress) {
    return <></>;
  }
  return (
    <Dialog open={true} onClose={() => done()} maxWidth={'md'}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />
        <Stack spacing={2} sx={{ width: '30em', padding: '1em 0' }}>
          <AddressBoxWithCopy
            key={'contractAddress'}
            label={'Contract Address*'}
            value={contractAddress}
            reduced={false}
            useNames={true}
          />
          <AttributeRow key={'name'} value={name} label={'Instance Name*'} />
          <AttributeRow key={'contractName'} value={contractName} label={'Contract Name (e.g. AddressBook)*'} />
          <AttributeRow key={'description'} value={description} label={'Description'} />{' '}
          <AttributeRow key={'url'} value={url} label={'Url (Documentation)'} />
          <AttributeRow key={'sourceCodeUrl'} value={sourceCodeUrl} label={'Source Code Url'} />
          <AttributeRow
            key={'contractType'}
            value={contractType}
            label={`Contract Types (e.g. ERC-20,${OwnableWithBackup}, ...)`}
          />
          <AttributeRow key={'constructorArgs'} value={constructorArgs} label={`Constructor Arguments`} />
          <AttributeRow key={'status'} value={status} label={`Status`} />
          <AttributeRow
            key={'created'}
            value={created ? moment(1000 * +created.toString()).format('YYYY-MM-DD HH:mm') : '-'}
            label={`Created`}
          />
          <AttributeRow
            key={'updated'}
            value={updated ? moment(1000 * +updated.toString()).format('YYYY-MM-DD HH:mm') : '-'}
            label={`Updated`}
          />
        </Stack>
        <Stack direction={'row'} alignItems={'flex-end'} justifyContent={'space-between'}>
          {contractType.includes(OwnableWithBackup) && (
            <Button
              onClick={() => action(OwnableWithBackup, index ?? -1)}
              key={'backup-owner-button'}
              disabled={!name || !contractName || !contractAddress}
            >
              Backup Owner Ui
            </Button>
          )}
          <Button key={'close'} onClick={() => done()}>
            Close
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function AttributeRow({
  value,
  label
}: Readonly<{
  value: string;
  label: string;
}>) {
  return <TextFieldView label={label} value={value} />;
}
