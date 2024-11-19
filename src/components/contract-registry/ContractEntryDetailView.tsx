import { NotifyFun, StatusMessage } from '../../types';
import { useState } from 'react';
import { ContractDataWithIndex } from '../../contracts/contract-registry/ContractRegistry-support';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { Button, Stack } from '@mui/material';
import moment from 'moment/moment';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { TextFieldView } from '../common/TextFieldView';
import { CommandName, OwnableWithBackup } from './ContractRegistryListUi';
import { AddressBoxWithCopy } from '../common/AddressBoxWithCopy';
import { useAppContext } from '../AppContextProvider';
import { ButtonPanel } from '../common/ButtonPanel';

export function ContractEntryDetailView({
  done,
  action,
  contractData
}: {
  readonly done: NotifyFun;
  readonly action: (command: CommandName, index: number) => void;
  readonly contractData: ContractDataWithIndex;
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
    <Dialog open={true} onClose={() => done()} maxWidth={'md'} fullWidth={true}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />
        <Stack spacing={2} sx={{ width: '100%', padding: '1em 0' }}>
          <AddressBoxWithCopy
            key={'contractAddress'}
            label={'Contract Address*'}
            value={contractAddress}
            reduced={false}
            useNames={true}
          />
          <TextFieldView key={'name'} value={name} label={'Instance Name*'} />
          <TextFieldView key={'contractName'} value={contractName} label={'Contract Name (e.g. AddressBook)*'} />
          <TextFieldView key={'description'} value={description} label={'Description'} />{' '}
          <TextFieldView key={'url'} value={url} label={'Url (Documentation)'} />
          <TextFieldView key={'sourceCodeUrl'} value={sourceCodeUrl} label={'Source Code Url'} />
          <TextFieldView
            key={'contractType'}
            value={contractType}
            label={`Contract Types (e.g. ERC-20,${OwnableWithBackup}, ...)`}
          />
          <TextFieldView key={'constructorArgs'} value={constructorArgs} label={`Constructor Arguments`} />
          <TextFieldView key={'status'} value={status} label={`Status`} />
          <TextFieldView
            key={'created'}
            value={created ? moment(1000 * +created.toString()).format('YYYY-MM-DD HH:mm') : '-'}
            label={`Created`}
          />
          <TextFieldView
            key={'updated'}
            value={updated ? moment(1000 * +updated.toString()).format('YYYY-MM-DD HH:mm') : '-'}
            label={`Updated`}
          />
        </Stack>
        <ButtonPanel
          mode={'space-between'}
          content={[
            contractType.includes('OwnableWithBackup') && (
              <Button
                key={'backup-owner-button'}
                onClick={() => action('OwnableWithBackup', index ?? -1)}
                disabled={!name || !contractName || !contractAddress}
              >
                Backup Owner Ui
              </Button>
            ),
            contractType.includes('OwnableWithBackup') && (
              <Button
                key={'change-owner'}
                onClick={() => action('Transfer', index ?? -1)}
                disabled={!name || !contractName || !contractAddress}
              >
                Change Owner
              </Button>
            ),
            <Button key={'close'} onClick={() => done()}>
              Close
            </Button>
          ]}
        />
      </DialogContent>
    </Dialog>
  );
}
