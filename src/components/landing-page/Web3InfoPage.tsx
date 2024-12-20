import * as React from 'react';
import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { NotifyFun } from '../../types';
import { Paper, Stack, Table, TableBody, TableContainer } from '@mui/material';
import { getNetworkInfo } from '../../network-info';
import Web3 from 'web3';
import { ContractName, getContractAddress } from '../../contracts/contract-utils';
import { useAppContext } from '../AppContextProvider';
import { TableRowInfo } from '../common/TableRowInfo';
import { displayUsdPrice, useUsdPrice } from '../../prices/get-prices';

export function Web3InfoPage({ open, done }: Readonly<{ open: boolean; done: NotifyFun }>) {
  const app = useAppContext();
  const { web3Session, publicKeyFromStore } = app || {};
  const { publicAddress, web3, networkId = 0, publicKey = '' } = web3Session || {};

  const [loading, setLoading] = useState(false);
  const [balanceWei, setBalanceWei] = useState('');
  const [chainId, setChainId] = useState(-1);
  const [gasPriceWei, setGasPriceWei] = useState(-1);

  const symbol = getNetworkInfo(web3Session?.networkId).currencySymbol;
  const usdPrice = useUsdPrice(symbol);

  useEffect(() => {
    const load = async () => {
      if (web3 && publicAddress) {
        try {
          setLoading(true);
          const balanceWei0 = await web3.eth.getBalance(publicAddress);
          setBalanceWei(balanceWei0.toString());
          const chainId0 = await web3.eth.getChainId();
          setChainId(+chainId0.toString());
          const gasPriceWei0 = await web3.eth.getGasPrice();
          setGasPriceWei(+gasPriceWei0.toString());
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }
    };
    load();
  }, [open, publicAddress, web3, networkId]);

  if (!open) {
    return <></>;
  }

  const {
    faucetUrls,
    blockExplorerUrl,
    currencySymbol = 'n/a',
    name = 'n/a',
    homePage
  } = getNetworkInfo(networkId) || {};

  return (
    <Dialog open={open} onClose={done} fullWidth={true} maxWidth={'md'}>
      <DialogTitle>Info Page for {name}</DialogTitle>
      <DialogContent>
        <Stack spacing={4}>
          <DialogContentText>{`This page shows information about the currently connected blockchain: ${name}.`}</DialogContentText>
          <TableContainer key="table" component={Paper}>
            <Table sx={{ minWidth: 800 }}>
              <TableBody>
                <TableRowInfo key={'public-address'} label={'Your Address'} value={publicAddress} />
                <TableRowInfo
                  key={'balance-ether'}
                  label={`Your Balance in: ${currencySymbol}`}
                  value={
                    loading || !web3
                      ? 'loading'
                      : displayUsdPrice({
                          amount: web3.utils.fromWei(balanceWei, 'ether').toString(),
                          symbol,
                          usdPrice
                        })
                  }
                />
                <TableRowInfo
                  key={'publicKeyFromStore'}
                  label={'Your Public Key (from Store)'}
                  value={publicKeyFromStore}
                />
                <TableRowInfo key={'web3Session.publicKey'} label={'Your Public Key (Session)'} value={publicKey} />
                <TableRowInfo
                  key={'contract-registry'}
                  label={'Contract Registry'}
                  value={getContractAddress(networkId, ContractName.CONTRACT_REGISTRY)}
                />
                <TableRowInfo key={'name'} label={'Network Name'} value={loading || !web3 ? 'loading' : name} />
                <TableRowInfo key={'chain-id'} label={'Chain Id'} value={loading || !web3 ? 'loading' : '' + chainId} />
                <TableRowInfo
                  key={'gas-price-wei'}
                  label={'Gas Price Wei'}
                  value={loading || !web3 ? 'loading' : gasPriceWei + ''}
                />
                <TableRowInfo key={'faucet-urls'} label={'Faucet Urls'} type={'link'} values={faucetUrls} />
                <TableRowInfo
                  key={'block-explorer-url'}
                  label={'Block Explorer'}
                  type={'link'}
                  value={blockExplorerUrl}
                />
                <TableRowInfo key={'home-page'} label={'Home Page'} type={'link'} value={homePage} />
                <TableRowInfo key={'web3-version'} label={'Web3 version'} value={Web3.version} />
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button key={'close'} onClick={done}>
          Close
        </Button>
        <Button key={'logout'} onClick={() => window.location.reload()}>
          Logout
        </Button>
      </DialogActions>
    </Dialog>
  );
}
