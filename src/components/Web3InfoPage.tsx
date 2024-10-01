import * as React from 'react';
import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { NotifyFun } from '../types';
import { Paper, Stack, Table, TableBody, TableContainer } from '@mui/material';
import { getNetworkInfo } from '../network-info';
import Web3 from 'web3';
import { ContractName, getContractAddress } from '../contracts/contract-utils';
import { useAppContext } from './AppContextProvider';
import { InfoTableRow } from './common/InfoTableRow';

export function Web3InfoPage({ open, done }: Readonly<{ open: boolean; done: NotifyFun }>) {
  const app = useAppContext();
  const { web3Session, publicKeyFromStore } = app || {};
  const { publicAddress, web3, networkId = 0 } = web3Session || {};

  const [loading, setLoading] = useState(false);
  const [balanceWei, setBalanceWei] = useState('');
  const [chainId, setChainId] = useState(-1);
  const [gasPriceWei, setGasPriceWei] = useState(-1);

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
          <DialogContentText>{`This page shows information about the current connected blockchain ${name}.`}</DialogContentText>
          <TableContainer key="table" component={Paper}>
            <Table sx={{ minWidth: 800 }}>
              <TableBody>
                <InfoTableRow key={'Your Address'} label={'Your Address'} value={publicAddress} />
                <InfoTableRow
                  key={'balance-ether'}
                  label={`Your Balance ${currencySymbol}`}
                  value={loading || !web3 ? 'loading' : web3.utils.fromWei(balanceWei, 'ether').toString()}
                />
                <InfoTableRow
                  key={'Your Public Key (from Store)'}
                  label={'Your Public Key (from Store)'}
                  value={publicKeyFromStore}
                />
                <InfoTableRow
                  key={'Your Public Key'}
                  label={'Your Public Key (Session)'}
                  value={web3Session?.publicKeyHolder?.publicKey}
                />
                <InfoTableRow
                  key={'Contract Registry'}
                  label={'Contract Registry'}
                  value={getContractAddress(networkId, ContractName.CONTRACT_REGISTRY)}
                />
                <InfoTableRow key={'name'} label={'Network Name'} value={loading || !web3 ? 'loading' : name} />
                <InfoTableRow key={'id'} label={'Chain Id'} value={loading || !web3 ? 'loading' : '' + chainId} />
                <InfoTableRow
                  key={'gas'}
                  label={'Gas Price Wei'}
                  value={loading || !web3 ? 'loading' : gasPriceWei + ''}
                />
                <InfoTableRow key={'faucet-urls'} label={'Faucet Urls'} type={'link'} values={faucetUrls} />
                <InfoTableRow
                  key={'block-explorer-url'}
                  label={'Block Explorer'}
                  type={'link'}
                  value={blockExplorerUrl}
                />
                <InfoTableRow key={'home-page'} label={'Home Page'} type={'link'} value={homePage} />
                <InfoTableRow key={'web3-version'} label={'Web3 version'} value={Web3.version} />
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button key={'close'} onClick={done}>
          Close
        </Button>
        <Button key={'logout'} onClick={() => app?.setWeb3Session()}>
          Logout
        </Button>
      </DialogActions>
    </Dialog>
  );
}
