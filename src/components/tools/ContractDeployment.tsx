import * as React from 'react';
import { ChangeEvent, useState } from 'react';
import { Button, Stack, TextField, Tooltip } from '@mui/material';
import { StyledHead } from '../common/StyledHead';
import { isStatusMessage, StatusMessage } from '../../types';
import { AddressBoxWithCopy } from '../common/AddressBoxWithCopy';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { addressBookAbi, addressBookBytecode } from '../../contracts/address-book/AddressBook-support';
import { deployContract } from '../../contracts/deploy-contract';
import { useAppContext } from '../AppContextProvider';

export function ContractDeployment() {
  const { wrap, web3Session } = useAppContext();
  const { web3, publicAddress } = web3Session || {};
  const [contractABI, setContractABI] = useState(JSON.stringify(addressBookAbi));
  const [contractBytecode, setContractBytecode] = useState(addressBookBytecode);
  const [contractAddress, setContractAddress] = useState('');
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();

  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ borderBottom: 'solid 2px gray' }}
      >
        <StyledHead></StyledHead>

        <Stack direction={'row'}>
          <Tooltip title={'Deploy the contract to the connected blochchain...'}>
            <Button
              disabled={!contractABI}
              key={'deploy'}
              onClick={async () => {
                if (contractBytecode && publicAddress && web3 && contractABI) {
                  const contractAddress = await wrap('Deploying Contract...', () =>
                    deployContract({
                      web3,
                      contractABI,
                      contractBytecode,
                      from: publicAddress
                    })
                  );
                  if (isStatusMessage(contractAddress)) {
                    setStatusMessage(contractAddress);
                  } else {
                    setContractAddress(contractAddress);
                  }
                }
              }}
            >
              Deploy Contract
            </Button>
          </Tooltip>
        </Stack>
      </Stack>
      <StatusMessageElement statusMessage={statusMessage} />
      <TextField
        key={'contractABI'}
        value={contractABI}
        placeholder={'Contract ABI'}
        fullWidth={true}
        multiline={true}
        size={'small'}
        label={'Contract ABI'}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setContractABI(e.target.value)}
      />

      <TextField
        key={'contractBytecode'}
        value={contractBytecode}
        placeholder={'Contract Bytecode: 0x...'}
        fullWidth={true}
        multiline={true}
        size={'small'}
        label={'Contract Bytecode 0x...'}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setContractBytecode(e.target.value)}
      />

      {contractAddress && (
        <AddressBoxWithCopy
          key={'Contract Address'}
          value={contractAddress}
          label={'Contract Address'}
          reduced={false}
        />
      )}
    </Stack>
  );
}
