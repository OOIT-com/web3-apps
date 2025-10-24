import { Box, Stack, Table, TableBody } from '@mui/material';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
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
import { infoMessage, StatusMessage } from '../../utils/status-message';

const arName = 'Irys (Arweave)';

export function IrysFundingUi({ irysAccess }: Readonly<{ irysAccess: IrysAccess }>) {
  const { wrap, web3Session } = useAppContext();
  const [irysData, setIrysData] = useState<IrysData>();
  const [statusMessage, setStatusMessage] = useState<StatusMessage | undefined>(infoMessage(`Connecting ${arName}...`));

  const refreshIrysData = useCallback(async () => {
    return wrap(`Loading Data for ${arName}...`, async () => {
      setStatusMessage(undefined);
      const { address, blockchainBalance, balance, statusMessage, pricePerMega, uploadableMegabytes } =
        await loadIrysData(irysAccess);
      if (statusMessage.status === 'error') {
        setStatusMessage(statusMessage);
      } else {
        setIrysData({ blockchainBalance, address, balance, pricePerMega, uploadableMegabytes });
      }
    });
  }, [wrap, irysAccess]);

  const symbol = getNetworkInfo(web3Session?.chainId).currencySymbol;
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
            key={'blockchain-balance'}
            elements={[
              <Box key={'title'} sx={{ fontWeight: 'bold' }}>{`Your balance on ${displayAddress(
                irysAccess.getAddress()
              )}`}</Box>,
              displayUsdPrice({ amount: +irysData.blockchainBalance / 1e18, symbol, usdPrice })
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
        </TableBody>
      </Table>
      <Stack direction={'row'} spacing={1}>
        <Button onClick={() => refreshIrysData()}>refresh</Button>
      </Stack>
    </Stack>
  );
}
