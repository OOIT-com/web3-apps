import { infoMessage, isStatusMessage, NotifyFun, StatusMessage, warningMessage } from '../../types';
import { useState } from 'react';
import { ContractData, getContractRegistry } from '../../contracts/contract-registry/ContractRegistry-support';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { Button, Stack, TextField } from '@mui/material';
import { isAddress } from 'ethers';
import { displayAddress } from '../../utils/misc-util';
import { LDBox } from '../common/StyledBoxes';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { useAppContext } from '../AppContextProvider';

export function ContractDataRetrieveDialog({
  done,
  openForEdit
}: Readonly<{
  readonly done: NotifyFun;
  openForEdit?: (contractData: ContractData) => void;
}>) {
  const { wrap } = useAppContext();

  const [retrieveValue, setRetrieveValue] = useState('');
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [contractData, setContractData] = useState<ContractData>();

  const contractRegistry = getContractRegistry();
  if (!contractRegistry) {
    console.warn('ContractRegistry not initialized!');
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
          <Stack direction={'row'} alignItems={'flex-end'} justifyContent={'space-between'}>
            <Button
              key={'retrieve'}
              onClick={() =>
                wrap(
                  `Retrieve by ${isAddress(retrieveValue) ? 'Address' : 'Name'} for : ${retrieveValue}`,
                  async () => {
                    const contractRegistry = getContractRegistry();
                    if (!contractRegistry) {
                      console.warn('ContractRegistry not initialized!');
                      return;
                    }
                    let entry: ContractData | StatusMessage;
                    if (isAddress(retrieveValue)) {
                      entry = await contractRegistry.getByAddress(retrieveValue);
                    } else {
                      entry = await contractRegistry.getByName(retrieveValue);
                    }
                    if (isStatusMessage(entry)) {
                      setStatusMessage(entry);
                    } else if (entry.name) {
                      setStatusMessage(infoMessage(`Found ${entry.name} (${displayAddress(entry.contractAddress)})`));
                      setContractData(entry);
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
            {openForEdit && contractData && (
              <Button key={'open-for-edit'} onClick={() => openForEdit(contractData)}>
                Open for Edit
              </Button>
            )}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
