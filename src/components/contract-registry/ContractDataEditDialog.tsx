import { isStatusMessage, NotifyRefresh, StatusMessage, warningMessage } from '../../types';
import { FC, useState } from 'react';
import {
  ContractDataWithIndex,
  getContractRegistry,
  newContractDataTemplate
} from '../../contracts/contract-registry/ContractRegistry-support';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { Button, Stack, TextField, TextFieldProps } from '@mui/material';
import moment from 'moment/moment';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { useAppContext } from '../AppContextProvider';

export function ContractDataEditDialog({
  done,
  contractDataIn
}: {
  readonly done: NotifyRefresh;
  readonly contractDataIn: ContractDataWithIndex | 'new';
}) {
  const { wrap, web3Session, dispatchSnackbarMessage } = useAppContext();
  const { publicAddress } = web3Session || {};
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [contractData, setContractData] = useState(
    contractDataIn !== 'new' ? contractDataIn : newContractDataTemplate('', '')
  );
  const setCd = (name: string, value: string) => setContractData((cd) => ({ ...cd, [name]: value }));
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

  const isUpdate = contractDataIn !== 'new';

  let title = 'New Contract to Register...';
  if (isUpdate) {
    title = `Registered Contract ${index === undefined ? '' : 'Nr ' + (index + 1)}`;
  }

  const [refreshNeeded, setRefreshNeeded] = useState(false);
  const contractRegistry = getContractRegistry();
  if (!contractRegistry) {
    console.warn('ContractRegistry not initialized!');
  }
  if (!publicAddress) {
    return <></>;
  }
  return (
    <Dialog open={true} onClose={() => done(refreshNeeded)} maxWidth={'md'}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />
        <Stack spacing={2} sx={{ width: '30em', padding: '1em 0' }}>
          <TextField
            disabled={isUpdate}
            key={'contractAddress'}
            label={'Contract Address*'}
            size={'small'}
            fullWidth={true}
            value={contractAddress}
            onChange={(e) => setCd('contractAddress', e.target.value)}
          />
          <AttributeRow key={'name'} value={name} label={'Instance Name*'} change={(value) => setCd('name', value)} />
          <AttributeRow
            key={'contractName'}
            value={contractName}
            label={'Contract Name (e.g. AddressBook)*'}
            change={(value) => setCd('contractName', value)}
          />
          <AttributeRow
            key={'description'}
            value={description}
            label={'Description'}
            change={(value) => setCd('description', value)}
            minRows={3}
          />
          <AttributeRow key={'url'} value={url} label={'Url (Documentation)'} change={(value) => setCd('url', value)} />
          <AttributeRow
            key={'sourceCodeUrl'}
            value={sourceCodeUrl}
            label={'Source Code Url'}
            change={(value) => setCd('sourceCodeUrl', value)}
          />
          <AttributeRow
            key={'contractType'}
            value={contractType}
            label={'Contract Type (e.g. ERC-20, Ownable, ...'}
            change={(value) => setCd('contractType', value)}
          />
          <AttributeRow
            key={'constructorArgs'}
            value={constructorArgs}
            disabled={isUpdate}
            label={`Constructor Arguments (eg.:"MyCoolCoin", "MCC")`}
            change={(value) => setCd('constructorArgs', value)}
          />
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
              value={created && moment(1000 * +created.toString()).format('YYYY-MM-DD HH:mm')}
            />
          )}
          {isUpdate && (
            <TextField
              disabled={true}
              key={'updated'}
              label={'Updated'}
              size={'small'}
              fullWidth={true}
              value={updated && moment(1000 * +updated.toString()).format('YYYY-MM-DD HH:mm')}
            />
          )}
        </Stack>
        <Stack direction={'row'} alignItems={'flex-end'} justifyContent={'space-between'}>
          {isUpdate ? (
            <Button
              key={'update'}
              onClick={async () => {
                const contractRegistry = getContractRegistry();
                if (!contractRegistry) {
                  return;
                }
                const res = await wrap(`Update ${name} ...`, () =>
                  contractRegistry.update(contractData, publicAddress)
                );
                if (isStatusMessage(res)) {
                  console.log(res);
                  if (res.status === 'success') {
                    done(true);
                    dispatchSnackbarMessage(warningMessage('Update may take a couple of second!'));
                  }
                } else {
                  setRefreshNeeded(true);
                }
              }}
              disabled={!name || !contractName || !contractAddress}
            >
              Update
            </Button>
          ) : (
            <Button
              key={'register'}
              onClick={async () => {
                const contractRegistry = getContractRegistry();
                if (!contractRegistry) {
                  return;
                }
                const res = await wrap(`Register ${name} ...`, () =>
                  contractRegistry.register(contractData, publicAddress)
                );
                setStatusMessage(res);
                if (res.status === 'success') {
                  done(true);
                  dispatchSnackbarMessage(warningMessage('Register may take a couple of second!'));
                } else {
                  setStatusMessage(res);
                }
              }}
              disabled={!name || !contractName || !contractAddress}
            >
              Register
            </Button>
          )}
          <Button key={'close'} onClick={() => done(refreshNeeded)}>
            Close
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

const AttributeRow: FC<TextFieldProps & { minRows?: number; change: (value: string) => void }> = ({
  change,
  minRows = 1,
  value
}) => (
  <TextField
    fullWidth={true}
    value={value}
    onChange={(e) => change(e.target.value)}
    rows={minRows}
    multiline={minRows > 1}
  />
);
