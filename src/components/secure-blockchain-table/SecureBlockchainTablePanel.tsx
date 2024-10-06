import { Button, TextField } from '@mui/material';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { errorMessage, infoMessage, isStatusMessage, NotifyFun, StatusMessage } from '../../types';
import { StatusMessageElement } from '../common/StatusMessageElement';
import {
  ContractData,
  getContractRegistry,
  newContractDataTemplate
} from '../../contracts/contract-registry/ContractRegistry-support';
import {
  secureBlockchainTableAbi,
  secureBlockchainTableBytecode
} from '../../contracts/secure-blockchain-table/SecureBlockchainTable';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import { ContractConstructorArgs } from 'web3-types';
import { deployContract } from '../../contracts/deploy-contract';
import { newEncSecret } from '../../utils/enc-dec-utils';
import { useAppContext } from '../AppContextProvider';

export function SecureBlockchainTablePanel({ refresh }: Readonly<{ refresh: NotifyFun }>) {
  const { wrap, web3Session } = useAppContext();
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();

  const [registerName, setRegisterName] = useState('');
  const [namesUsed, setNamesUsed] = useState<string[]>([]);

  const contractRegistry = getContractRegistry();

  useEffect(() => {
    const _do = async () => {
      if (contractRegistry) {
        const names = await contractRegistry.getAllNames();
        setNamesUsed(isStatusMessage(names) ? [] : names);
      }
    };
    _do();
  }, [contractRegistry]);

  if (!web3Session) {
    return <StatusMessageElement statusMessage={infoMessage('Web3 not initialized')} />;
  }

  const { publicAddress, web3 } = web3Session;
  const existError = namesUsed.includes(registerName);

  return (
    <CollapsiblePanel
      level={'third'}
      title={'Deploy a new Salary Manager'}
      toolbar={[
        <Button
          key={'Deploy'}
          disabled={!registerName}
          onClick={async () => {
            const encSecret = await wrap(`Salary Manager Registration ${registerName}...`, async () => {
              return newEncSecret(web3Session);
            });
            if (isStatusMessage(encSecret)) {
              setStatusMessage(encSecret);
              return;
            }

            const constructorArgs: ContractConstructorArgs<typeof secureBlockchainTableAbi> = [encSecret];
            const contractAddress = await wrap(`Deploy new Salary Manager ${registerName}...`, () =>
              deployContract({
                web3,
                contractABI: JSON.stringify(secureBlockchainTableAbi),
                contractBytecode: secureBlockchainTableBytecode,
                from: publicAddress,
                constructorArgs
              })
            );
            if (isStatusMessage(contractAddress)) {
              setStatusMessage(contractAddress);
              return;
            }

            const res = await wrap(`Secure Blockchain Table Registration ${registerName}...`, async () => {
              if (publicAddress && contractRegistry) {
                setStatusMessage(undefined);
                const contractData: ContractData = {
                  ...newContractDataTemplate(registerName, contractAddress),
                  description: '',
                  contractName: 'SecureBlockchainTable',
                  contractType: 'SecureBlockchainTable,OwnableWithBackup',
                  sourceCodeUrl: '',
                  constructorArgs: JSON.stringify(constructorArgs)
                };
                return await contractRegistry.register(contractData, publicAddress);
              }
              return errorMessage('Contract Registry not available!');
            });
            setStatusMessage(res);
            refresh();
          }}
        >
          Deploy...
        </Button>,
        <Button
          key={'clear'}
          disabled={!registerName}
          onClick={() => {
            setRegisterName('');
          }}
        >
          Clear
        </Button>
      ]}
      content={[
        <TextField
          key={'text-field'}
          fullWidth={true}
          placeholder={'e.g. Salaries_2025'}
          label={'Name of Salary Manager Contract'}
          onChange={(e) => setRegisterName(e.target.value)}
          value={registerName}
          helperText={existError ? 'Name is already in use!' : ''}
          error={existError}
        />,
        <StatusMessageElement
          key={'status'}
          statusMessage={statusMessage}
          onClose={() => setStatusMessage(undefined)}
        />
      ]}
    />
  );
}
