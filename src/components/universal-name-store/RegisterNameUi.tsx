import * as React from 'react';
import { FC, Fragment, useCallback, useEffect, useState } from 'react';
import { errorMessage, infoMessage, isStatusMessage, StatusMessage, warningMessage } from '../../types';
import { Box, Stack, Table, TableBody, ToggleButton, ToggleButtonGroup } from '@mui/material';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { AddressBoxWithCopy } from '../common/AddressBoxWithCopy';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { ContractName } from '../../contracts/contract-utils';
import { useAppContext } from '../AppContextProvider';
import { UniversalNameStore } from '../../contracts/universal-name-store/UniversalNameStore-support';
import { ConfirmData, ConfirmDialog } from '../common/ConfirmDialog';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import { isAddress, weiToEther } from '../../utils/web3-utils';
import { TableRowComp } from '../common/TableRowComp';
import { Html } from '../common/Html';
import { Web3NotInitialized } from '../common/Web3NotInitialized';
import helpFile from './RegisterNameHelp.md';

export const RegisterNameUi: FC<{ universalNameStore: UniversalNameStore }> = ({ universalNameStore }) => {
  const app = useAppContext();
  const { wrap } = app;
  const { web3, publicAddress } = app.web3Session || {};
  const [myName, setMyName] = useState('');
  const [addrUpdate, setAddrUpdate] = useState('');
  const [mode, setMode] = useState<'contract' | 'myAddress'>('myAddress');
  const [myNameUpdate, setMyNameUpdate] = useState('');
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();

  const [confirmData, setConfirmData] = useState<ConfirmData>();
  const [fee, setFee] = useState('');

  const refreshData = useCallback(
    (addr: string) =>
      wrap('Refresh data...', async () => {
        setStatusMessage(undefined);
        if (universalNameStore && addr) {
          // fee
          const res = await universalNameStore.getFee();
          if (isStatusMessage(res)) {
            setStatusMessage(res);
          } else {
            setFee(weiToEther(res));
          }

          if (!isAddress(addr)) {
            setStatusMessage(infoMessage(`Address ${addr} is not valid!`));
            setMyName('');
            setMyNameUpdate('');
            return;
          }

          // my name
          const name = await universalNameStore.getName(addr);
          if (isStatusMessage(name)) {
            setStatusMessage(name);
          } else {
            setMyName(name);
            setMyNameUpdate(name);
          }
        }
      }),
    [wrap, universalNameStore]
  );

  useEffect(() => {
    setMyName('');
    setAddrUpdate('');
    setMyNameUpdate('');
    if (mode === 'myAddress' && publicAddress) {
      refreshData(publicAddress).catch(console.error);
    }
  }, [refreshData, mode, publicAddress]);

  if (!web3 || !publicAddress) {
    return <Web3NotInitialized />;
  }
  if (!universalNameStore) {
    return (
      <StatusMessageElement
        statusMessage={warningMessage(`No contract found for ${ContractName.UNIVERSAL_NAME_STORE}`)}
      />
    );
  }

  const _resolvedAddr = mode === 'contract' ? addrUpdate : publicAddress;
  const resolvedAddr = isAddress(_resolvedAddr) ? _resolvedAddr : '';
  const title = myName ? `Your Universal Name: ${myName}` : 'My Universal Names';
  const toolbar = (
    <Stack key={'mode-toggle'} direction={'row'} spacing={1}>
      <ToggleButtonGroup color="primary" value={mode} exclusive onChange={(event, value) => setMode(value)}>
        <ToggleButton value="myAddress" sx={{ whiteSpace: 'nowrap' }}>
          My Address
        </ToggleButton>
        <ToggleButton value="contract" sx={{ whiteSpace: 'nowrap' }}>
          Contract Address
        </ToggleButton>
      </ToggleButtonGroup>
      <Button key={'refresh-button'} onClick={() => refreshData(resolvedAddr)}>
        Refresh
      </Button>
    </Stack>
  );

  return (
    <CollapsiblePanel
      title={title}
      help={helpFile}
      level={'second'}
      collapsible={true}
      collapsed={true}
      toolbar={toolbar}
      content={[
        <StatusMessageElement key={'sm1'} statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />,
        <Table key={'ui-table'}>
          <TableBody>
            <TableRowComp
              key={'address-row'}
              elements={[
                <Stack key={'my-name-label'}>
                  {mode === 'myAddress' && <Box sx={{ fontWeight: 600 }}>My Address</Box>}
                  {mode === 'contract' && <Box sx={{ fontWeight: 600 }}>Contract Address</Box>}
                </Stack>,
                <Stack key={'public-address'}>
                  {mode === 'myAddress' && <AddressBoxWithCopy value={publicAddress} reduced={false} />}
                  {mode === 'contract' && (
                    <TextField
                      size={'small'}
                      placeholder={'Contract Address'}
                      value={addrUpdate}
                      onChange={(e) => setAddrUpdate(e.target.value)}
                      fullWidth
                      error={!resolvedAddr}
                      helperText={!resolvedAddr ? 'Not a valid address!' : ''}
                    />
                  )}
                </Stack>
              ]}
            />
            <TableRowComp
              key={'name-row'}
              elements={[
                <Stack key={'my-name-label'}>
                  {mode === 'myAddress' && <Box sx={{ fontWeight: 600 }}>My Universal Name</Box>}
                  {mode === 'contract' && <Box sx={{ fontWeight: 600 }}>Name for Contract</Box>}
                </Stack>,
                <Stack key={'my-name'}>
                  <TextField
                    size={'small'}
                    disabled={!!myName || !resolvedAddr}
                    placeholder={'Your unique name'}
                    value={myNameUpdate}
                    onChange={(e) => setMyNameUpdate(e.target.value)}
                    fullWidth
                  />
                </Stack>
              ]}
            />
            <TableRowComp
              key={'buttons'}
              colspan={[2]}
              elements={[
                <Stack key={'stack'} direction={'row'} spacing={1}>
                  <Button
                    key={'save'}
                    disabled={!!myName}
                    onClick={async () => {
                      setStatusMessage(undefined);
                      // check name
                      const checkRes = await wrap(`Check correctness of name ${myNameUpdate}...`, () =>
                        universalNameStore.checkValidString(myNameUpdate)
                      );
                      if (checkRes === false) {
                        setStatusMessage(errorMessage(`Name ${myNameUpdate} is not valid!`));
                        return;
                      }
                      if (isStatusMessage(checkRes)) {
                        setStatusMessage(checkRes);
                        return;
                      }
                      // is name taken
                      const checkTaken = await wrap(`Check if ${myNameUpdate} is taken...`, () =>
                        universalNameStore.getAddressByName(myNameUpdate)
                      );
                      if (typeof checkTaken === 'string' && checkTaken.length > 0) {
                        setStatusMessage(errorMessage(`Name ${myNameUpdate} is taken!`));
                        return;
                      }
                      if (isStatusMessage(checkTaken)) {
                        setStatusMessage(checkTaken);
                        return;
                      }

                      if (resolvedAddr) {
                        await refreshData(resolvedAddr);
                        setConfirmData({
                          title: `Save ${myNameUpdate} to Universal Name Service`,
                          content: [
                            <Fragment key={1}>{`Saving the name ${myNameUpdate} will cost a fee of ${fee}`}</Fragment>,
                            <Html key={2} content={'Please press <b>accept</b> to start the registration!'} />
                          ],
                          accept: () => {
                            wrap(`Saving ${myNameUpdate} ot UNS...`, async () => {
                              const contractAddress = mode === 'contract' ? addrUpdate : undefined;
                              if (contractAddress && !isAddress(contractAddress)) {
                                setStatusMessage(errorMessage(`Address ${contractAddress} is not value`));
                                return;
                              }

                              setConfirmData(undefined);
                              if (universalNameStore) {
                                const res = await universalNameStore.registerName(myNameUpdate, contractAddress);
                                await refreshData(resolvedAddr);
                                if (isStatusMessage(res)) {
                                  setStatusMessage(res);
                                }
                              }
                            });
                          },
                          cancel: () => setConfirmData(undefined)
                        });
                      }
                    }}
                  >
                    Register Name
                  </Button>
                  <Button
                    key={'delete-button'}
                    disabled={!myName}
                    onClick={async () => {
                      if (resolvedAddr) {
                        await refreshData(resolvedAddr);
                        setConfirmData({
                          title: `Delete ${myName} to UNS`,
                          content: [
                            <Fragment key={1}>{`Do you want to delele the name ${myName}? (Fee: ${fee})`}</Fragment>
                          ],
                          accept: () => {
                            wrap(`Saving ${myNameUpdate} ot UNS...`, async () => {
                              setConfirmData(undefined);
                              if (universalNameStore) {
                                const res = await universalNameStore.deleteName(myNameUpdate);
                                await refreshData(resolvedAddr);
                                if (isStatusMessage(res)) {
                                  setStatusMessage(res);
                                }
                              }
                            });
                          },
                          cancel: () => setConfirmData(undefined)
                        });
                      }
                    }}
                  >
                    Delete
                  </Button>
                </Stack>
              ]}
            />
          </TableBody>
        </Table>,

        <Stack key={'confirm-dialog'}>{confirmData ? <ConfirmDialog confirmData={confirmData} /> : ''}</Stack>
      ]}
    />
  );
};
