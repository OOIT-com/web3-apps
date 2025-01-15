import { Box, Stack, Table, TableBody } from '@mui/material';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { infoMessage, StatusMessage } from '../../types';
import Button from '@mui/material/Button';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { TableRowComp } from '../common/TableRowComp';
import { Header2 } from '../common/StyledBoxes';
import { AddressBoxWithCopy } from '../common/AddressBoxWithCopy';
import { displayAddress } from '../../utils/misc-util';
import { IrysAccess } from '../../utils/IrysAccess';
import { useAppContext } from '../AppContextProvider';
import { IrysData, loadIrysData } from '../../utils/irys-utils';
import { displayUsdPrice, useUsdPrice } from '../../prices/get-prices';
import { getNetworkInfo } from '../../network-info';

const arName = 'Irys (Arweave)';

export function IrysFundingUi({ irysAccess }: Readonly<{ irysAccess: IrysAccess }>) {
  const { wrap, web3Session } = useAppContext();
  const [irysData, setIrysData] = useState<IrysData>();
  //const [fundAmount, setFundAmount] = useState(0);
  // const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | undefined>(infoMessage(`Connecting ${arName}...`));

  const refreshIrysData = useCallback(async () => {
    return wrap(`Loading Data for ${arName}...`, async () => {
      setStatusMessage(undefined);
      const { address, polygonBalance, balance, statusMessage, pricePerMega, uploadableMegabytes } = await loadIrysData(
        irysAccess
      );
      if (statusMessage.status === 'error') {
        setStatusMessage(statusMessage);
      } else {
        setIrysData({ polygonBalance, address, balance, pricePerMega, uploadableMegabytes });
      }
    });
  }, [wrap, irysAccess]);

  const symbol = getNetworkInfo(web3Session?.networkId).currencySymbol;
  const usdPrice = useUsdPrice(symbol);

  useEffect(() => {
    refreshIrysData().catch(console.error);
  }, [refreshIrysData]);

  if (statusMessage) {
    return <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />;
  }

  if (!irysData) {
    return <StatusMessageElement statusMessage={infoMessage('No Irys Data available!')} />;
  }

  // const fundStatus = fundAmount <= +(irysData.polygonBalance || '0') / 1e18 && fundAmount > 0;

  // const withdrawAmountStatus = withdrawAmount <= +(irysData?.loadedBalance || '0') / 1e18 && withdrawAmount > 0;

  return (
    <Stack justifyContent="flex-start" alignItems="start" spacing={0.6}>
      <Table>
        <TableBody>
          <TableRowComp
            key={'connection'}
            elements={[<Header2 key={'header'}>Irys Upload Funding </Header2>]}
            colspan={[3]}
          />
          <TableRowComp
            key={'address'}
            elements={[
              <Box key={'title'} sx={{ fontWeight: 'bold' }}>
                Connected address (Irys)
              </Box>,
              <AddressBoxWithCopy key={'address'} value={irysData.address} label={'Account'} reduced={true} />
            ]}
            colspan={[1, 2]}
          />
          <TableRowComp
            key={'fund-token-network'}
            elements={[
              <Box key={'title'} sx={{ fontWeight: 'bold' }}>{`Irys Token Parameter`}</Box>,
              irysAccess.getToken()
            ]}
            colspan={[1, 2]}
          />
          <TableRowComp
            key={'price-per-mb'}
            elements={[
              <Box key={'title'} sx={{ fontWeight: 'bold' }}>
                Price per MB
              </Box>,
              displayUsdPrice({ amount: +irysData.pricePerMega / 1e18, symbol, usdPrice })
            ]}
            colspan={[1, 2]}
          />
          <TableRowComp key={'balances'} elements={[<Header2 key={'title'}>Balances</Header2>]} colspan={[3]} />
          <TableRowComp
            key={'polygone-balance'}
            elements={[
              <Box key={'title'} sx={{ fontWeight: 'bold' }}>{`Your balance on ${displayAddress(
                irysAccess.getAddress()
              )}`}</Box>,
              displayUsdPrice({ amount: +irysData.polygonBalance / 1e18, symbol, usdPrice })
            ]}
            colspan={[1, 2]}
          />
          <TableRowComp
            key={'balance'}
            elements={[
              <Box key={'title'} sx={{ fontWeight: 'bold' }}>{`Irys balance (${irysAccess.getToken()})`}</Box>,
              displayUsdPrice({ amount: +irysData.balance / 1e18, usdPrice, symbol })
            ]}
            colspan={[1, 2]}
          />
          <TableRowComp
            key={'upload-allowance-in-mb'}
            elements={[
              <Box key={'title'} sx={{ fontWeight: 'bold' }}>
                Upload allowance in MB
              </Box>,
              irysData.uploadableMegabytes
            ]}
            colspan={[1, 2]}
          />
          {/*
          <TableRowComp
            key={'fund-withdraw'}
            elements={[<Header2 key={'title'}>Fund and Withdraw Actions</Header2>]}
            colspan={[3]}
          /> */}
          {/* FUND AMOUNT :: Disable as funding does not work yet
          <TableRowComp
            key={'funding'}
            elements={[
              <Box key={'title'} sx={{ fontWeight: 'bold' }}>
                Funding
              </Box>,
              <TextField
                key={'amount-to.fund'}
                label={'Amount to fund'}
                size={'small'}
                type={'number'}
                value={fundAmount}
                onChange={(e) => setFundAmount(+e.target.value)}
              ></TextField>,
              <Button
                key={'fund-button'}
                size={'small'}
                disabled={!fundStatus}
                onClick={async () => {
                  if (fundStatus) {
                    const res = await wrap(`Processing funding ${fundAmount}`, async () => {
                      try {
                        const fa = irysAccess.toAtomic(fundAmount);
                        if (fa) {
                          const fundTx = await irysAccess.fund(fa.toString());
                          console.log('fund tx id:', fundTx?.id);
                        }
                      } catch (e) {
                        return errorMessage(`Funding of ${fundAmount} failed!`, e);
                      } finally {
                        setFundAmount(0);
                      }
                    });
                    if (isStatusMessage(res)) {
                      setStatusMessage(res);
                    } else {
                      await refreshIrysData();
                    }
                  }
                }}
              >
                Fund {fundAmount}
              </Button>
            ]}
          />
            */}
          {/* WITHDRAW AMOUNT
          <TableRowComp
            key={'withdraw'}
            elements={[
              <Box key={'title'} sx={{ fontWeight: 'bold' }}>
                Withdraw
              </Box>,
              <TextField
                key={'amount-to-withdraw'}
                label={'Amount to withdraw'}
                size={'small'}
                type={'number'}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(+e.target.value)}
              />,
              <Button
                key={'withdraw-button'}
                size={'small'}
                disabled={!withdrawAmountStatus}
                onClick={async () => {
                  if (withdrawAmountStatus) {
                    const res = await wrap(`Processing withdraw ${withdrawAmount}`, async () => {
                      try {
                        const r = await irysAccess.withdrawBalance(irysAccess.toAtomic(withdrawAmount));
                        console.log('withdraw tx id:', r?.tx_id);
                      } catch (e) {
                        return errorMessage(`Withdraw of ${withdrawAmount} failed!`, e);
                      } finally {
                        setWithdrawAmount(0);
                      }
                    });
                    if (isStatusMessage(res)) {
                      setStatusMessage(res);
                    } else {
                      await refreshIrysData();
                    }
                  }
                }}
              >
                Withdraw {withdrawAmount}
              </Button>
            ]}
          />*/}
        </TableBody>
      </Table>
      <Stack direction={'row'} spacing={1}>
        <Button onClick={() => refreshIrysData()}>refresh</Button>
      </Stack>
    </Stack>
  );
}
