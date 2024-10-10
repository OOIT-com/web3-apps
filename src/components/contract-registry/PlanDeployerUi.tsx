import { isStatusMessage, NotifyFun, StatusMessage, warningMessage } from '../../types';
import { Button, Stack, Table, TableBody, TextField } from '@mui/material';
import { LDBox } from '../common/StyledBoxes';
import { Fragment, ReactNode, useEffect, useState } from 'react';
import { StatusMessageElement } from '../common/StatusMessageElement';
import TableRowComp from '../common/TableRowComp';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import {
  getContractRegistry,
  newContractDataTemplate
} from '../../contracts/contract-registry/ContractRegistry-support';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import { AddressBoxWithCopy } from '../common/AddressBoxWithCopy';
import { DeploymentPlan } from '../../contracts/types';
import { deploymentPlans } from '../../contracts/deployment-plans';
import { deployContract } from '../../contracts/deploy-contract';
import { useAppContext } from '../AppContextProvider';
import { CollapsiblePanel } from '../common/CollapsiblePanel';

export const planDeployerTitle = 'Contract Deployments';

export function PlanDeployerUi() {
  const { web3Session } = useAppContext();
  const { web3, publicAddress } = web3Session || {};
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [startDeployment, setStartDeployment] = useState(-1);

  if (!web3 || !publicAddress) {
    return <StatusMessageElement statusMessage={warningMessage('DeployerUi loading...')} />;
  }

  const content: ReactNode[] = [
    <StatusMessageElement
      key={'status-element'}
      statusMessage={statusMessage}
      onClose={() => setStatusMessage(undefined)}
    />,
    <Table key={'table'}>
      <TableBody>
        {deploymentPlans.map(({ label, contractName }, index) => (
          <TableRowComp
            key={contractName}
            elements={[
              <LDBox key={'label'} sx={{ fontWeight: 'bold' }}>
                {label}
              </LDBox>,
              <Button key={'deploy-button'} onClick={() => setStartDeployment(index)}>{`Deploy ${label}...`}</Button>
            ]}
          />
        ))}
      </TableBody>
    </Table>
  ];
  return (
    <Fragment>
      <CollapsiblePanel level={'second'} collapsible={false} title={planDeployerTitle} content={content} />
      {startDeployment > -1 && (
        <ConstructorArgsDialog plan={deploymentPlans[startDeployment]} done={() => setStartDeployment(-1)} />
      )}
    </Fragment>
  );
}

function ConstructorArgsDialog({
  plan,
  done
}: Readonly<{
  plan: DeploymentPlan;
  done: NotifyFun;
}>) {
  const { contractName, defaultRegistryName, label, contractType } = plan;
  const { wrap, web3Session } = useAppContext();
  const { web3, publicAddress } = web3Session || {};
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [args, setArgs] = useState<string[]>([]);
  const [deployedContract, setDeployedContract] = useState('');
  const [registerName, setRegisterName] = useState(label);
  const [namesUsed, setNamesUsed] = useState<string[]>([]);
  const [useDefault, setUseDefault] = useState(false);
  const contractRegistry = getContractRegistry();

  useEffect(() => {
    const _do = async () => {
      if (deployedContract && contractRegistry) {
        const names = await contractRegistry.getAllNames();
        setNamesUsed(isStatusMessage(names) ? [] : names);
      }
    };
    _do();
  }, [deployedContract, contractRegistry]);

  const existError = namesUsed.includes(registerName);
  if (!contractRegistry) {
    console.warn('No ContractRegistry available!');
    return <></>;
  }

  return (
    <Dialog open={true} onClose={done}>
      <DialogTitle>{deployedContract ? 'Contract Registration' : `Deploy new Contract: ${label}`}</DialogTitle>
      {deployedContract ? (
        <DialogContent key={'after-deployment'}>
          <LDBox>Contract Registration?</LDBox>
          <Stack spacing={2} sx={{ padding: '1em 0' }}>
            <DialogContentText>Would you like to registre your new Contract (Contract Registry)?</DialogContentText>
            <AddressBoxWithCopy value={deployedContract} useNames={false} label={'Contract Address'} reduced={false} />
            <Stack direction={'row'} alignContent={'flex-start'} alignItems={'center'}>
              <TextField
                fullWidth={true}
                label={'Choose unique Contract Instance name!'}
                key={'registerName'}
                size={'small'}
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                helperText={existError ? 'Name is already in use!' : ''}
                error={existError}
              />
              <Button
                onClick={() => {
                  setUseDefault((b) => {
                    if (b) {
                      setRegisterName(label);
                    } else {
                      setRegisterName(defaultRegistryName);
                    }
                    return !b;
                  });
                }}
              >
                {useDefault ? 'Any Name' : 'Use Registry Default'}
              </Button>
            </Stack>
            <Stack spacing={2} sx={{ padding: '1em 0' }}>
              <Stack direction={'row'} justifyContent={'space-between'}>
                <Button
                  key={'register'}
                  onClick={() =>
                    wrap(`Registering Contract ${registerName}...`, async () => {
                      if (publicAddress && contractRegistry) {
                        setStatusMessage(undefined);
                        const res = await contractRegistry.register(
                          {
                            ...newContractDataTemplate(registerName, deployedContract),
                            contractName,
                            contractType
                          },
                          publicAddress
                        );
                        if (res.status === 'error') {
                          setStatusMessage(res);
                        } else {
                          done();
                        }
                      }
                    })
                  }
                >
                  Yes
                </Button>
                <Button key={'no'} onClick={() => done()}>
                  No
                </Button>
              </Stack>
              <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />
            </Stack>
          </Stack>
        </DialogContent>
      ) : (
        <DialogContent key={'before-deployment'}>
          {'constructorArgDefs' in plan && plan.constructorArgDefs.length > 0 && <LDBox>Constructor Arguments</LDBox>}
          <Stack spacing={2} sx={{ padding: '1em 0' }}>
            {'constructorArgDefs' in plan && plan.constructorArgDefs.length > 0
              ? plan.constructorArgDefs.map(({ name }, index) => (
                  <TextField
                    label={name}
                    key={name}
                    size={'small'}
                    value={args[index] || ''}
                    onChange={(e) => setArgs([...args.slice(0, index), e.target.value, ...args.slice(index + 1)])}
                  />
                ))
              : ''}
            <Stack direction={'row'} justifyContent={'space-between'}>
              <Button
                key={'deploy now'}
                onClick={() =>
                  wrap(`Deployment of ${label} processing...`, async () => {
                    if (web3 && publicAddress) {
                      setStatusMessage(undefined);
                      if ('contractABI' in plan && 'contractBytecode' in plan) {
                        const { contractABI, contractBytecode } = plan;
                        const res = await deployContract({
                          web3,
                          contractABI,
                          contractBytecode,
                          from: publicAddress,
                          constructorArgs: args
                        });
                        if (isStatusMessage(res)) {
                          setStatusMessage(res);
                        } else {
                          setDeployedContract(res);
                        }
                      } else if (web3Session && 'deploymentFunction' in plan) {
                        const res = await plan.deploymentFunction(web3Session);
                        if (isStatusMessage(res)) {
                          setStatusMessage(res);
                        } else {
                          setDeployedContract(res);
                        }
                      }
                    }
                  })
                }
              >{`Deploy ${label}`}</Button>
              <Button key={'close'} onClick={() => done()}>
                Close
              </Button>
            </Stack>
            <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />
          </Stack>
        </DialogContent>
      )}
    </Dialog>
  );
}
