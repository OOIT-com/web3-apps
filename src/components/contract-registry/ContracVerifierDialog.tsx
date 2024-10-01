import { errorMessage, infoMessage, NotifyFun, StatusMessage } from '../../types';
import { useState } from 'react';
import { ContractData, getContractRegistry } from '../../contracts/contract-registry/ContractRegistry-support';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { Button, Stack } from '@mui/material';
import { displayAddress } from '../../utils/misc-util';
import { LDBox } from '../common/StyledBoxes';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { AddressBoxWithCopy } from '../common/AddressBoxWithCopy';
import { getNetworkInfo } from '../../network-info';
import { getMetaData } from '../artwork-time-proof/irys-utils';
import { useAppContext } from '../AppContextProvider';

export function ContracVerifierDialog({
  done,
  contractData
}: Readonly<{
  readonly done: NotifyFun;
  readonly contractData: ContractData;
}>) {
  const { wrap, web3Session } = useAppContext();
  const { web3, networkId = 0 } = web3Session || {};
  const [bytecode, setBytecode] = useState('');
  let statusMessage: StatusMessage | undefined;
  if (!web3Session) {
    statusMessage = errorMessage('No Web3 Session!');
  }

  const contractRegistry = getContractRegistry();
  if (!contractRegistry) {
    statusMessage = errorMessage('ContractRegistry not initialized!');
  }

  if (!web3 || !networkId || !networkId) {
    statusMessage = infoMessage('Loading...');
  }
  if (statusMessage) {
    return <StatusMessageElement statusMessage={statusMessage} />;
  }

  const info = getNetworkInfo(networkId);
  return (
    <Dialog open={true} onClose={() => done()} maxWidth={'md'} fullWidth={true}>
      <DialogTitle>Verifier Dialog for {`${contractData.name} (Contract: ${contractData.contractName})`}</DialogTitle>
      <DialogContent>
        <Stack spacing={1}>
          <StatusMessageElement statusMessage={statusMessage} />
          <LDBox sx={{ fontSize: '90%', fontStyle: 'italic' }}>Contract Abi and Bytecode</LDBox>
          <AddressBoxWithCopy
            key={'contract-address'}
            label={'Contract Address'}
            value={contractData.contractAddress}
          />
          <Stack direction={'row'} alignItems={'flex-end'} justifyContent={'space-between'}>
            <Button
              key={'getByteCode'}
              onClick={() =>
                wrap(
                  `Load Bytecode for ${displayAddress(contractData.contractAddress)} from Blockchain ${info.name}...`,
                  async () => {
                    if (!web3) {
                      return;
                    }
                    const res = await web3.eth.getCode(contractData.contractAddress);
                    if (res) {
                      setBytecode(res.toString());
                    }
                  }
                )
              }
            >
              Get Bytecode from Blockchain
            </Button>
          </Stack>
          {bytecode ? <AddressBoxWithCopy value={bytecode} reduced={true} label={'Loaded Bytecode'} /> : ''}
          {contractData.sourceCodeUrl ? (
            <>
              <AddressBoxWithCopy value={contractData.sourceCodeUrl} />
              <Button
                key={'load-source-code'}
                onClick={() =>
                  wrap(
                    `Load Source Code for ${displayAddress(contractData.contractAddress)} from ${contractData.url} ...`,
                    async () => {
                      await getMetaData(contractData.sourceCodeUrl);
                      const res = await fetch(contractData.sourceCodeUrl);
                      if (res.status === 200) {
                        console.debug(await res.text());
                      }
                    }
                  )
                }
              >
                Load Source Code
              </Button>
            </>
          ) : (
            <StatusMessageElement statusMessage={infoMessage('Contract has not source code url!')} />
          )}

          <Stack key={'source-code'}>Source Code</Stack>

          <Button
            key={'compile-source-code'}
            disabled={true}
            onClick={() =>
              wrap(
                `Load Source Code for ${displayAddress(contractData.contractAddress)} from ${contractData.url} ...`,
                () => Promise.resolve()
              )
            }
          >
            Compile Source Code
          </Button>
          <Stack key={'source-code'}>Source Code Compile Result</Stack>

          <Button
            key={'compare-byte-code'}
            disabled={true}
            onClick={() =>
              wrap(
                `Load Source Code for ${displayAddress(contractData.contractAddress)} from ${contractData.url} ...`,
                () => Promise.resolve()
              )
            }
          >
            Compile Source Code
          </Button>
          <Stack key={'byte-code-comparison-result'}>Byte Code Comparison Result</Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
