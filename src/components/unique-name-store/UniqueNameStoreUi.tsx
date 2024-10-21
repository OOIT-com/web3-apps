import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { errorMessage, infoMessage, isStatusMessage, successMessage, warningMessage } from '../../types';
import { Box, Divider, Grid, Stack } from '@mui/material';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { AddressBoxWithCopy } from '../common/AddressBoxWithCopy';
import ReactMarkdown from 'react-markdown';
import { getUniqueNameStore } from '../../contracts/unique-name-store/UniqueNameStore-support';

import { displayAddress } from '../../utils/misc-util';
import { LDBox } from '../common/StyledBoxes';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { ContractName } from '../../contracts/contract-utils';
import { useAppContext } from '../AppContextProvider';
import { Web3NotInitialized } from '../common/Web3NotInitialized';

export function UniqueNameStoreUi() {
  const app = useAppContext();
  const { wrap, dispatchSnackbarMessage } = app;
  const { web3, publicAddress } = app.web3Session || {};
  const [savedName, setSavedName] = useState('');
  const [myName, setMyName] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const uniqueNameStore = getUniqueNameStore();

  const getMyName = useCallback(async () => {
    const { wrap, dispatchSnackbarMessage } = app;
    const { web3, publicAddress } = app.web3Session || {};
    if (web3 && publicAddress && uniqueNameStore && wrap) {
      const uniqueName = await wrap('Reading my Unique Name', () => uniqueNameStore.getName(publicAddress));
      if (isStatusMessage(uniqueName)) {
        dispatchSnackbarMessage(uniqueName);
        return;
      } else if (!uniqueName) {
        dispatchSnackbarMessage(infoMessage(`There is no name saved for ${displayAddress(publicAddress)}`));
      }
      setMyName(uniqueName);
      setSavedName(uniqueName);
    }
  }, [app, uniqueNameStore]);

  const saveMyName = useCallback(async () => {
    const { wrap, dispatchSnackbarMessage } = app;
    const { web3, publicAddress } = app.web3Session || {};
    if (wrap && web3 && publicAddress && uniqueNameStore) {
      const addressFound = await wrap(`Checking if ${myName} is already taken...`, () =>
        uniqueNameStore.getAddress(myName, publicAddress)
      );
      if (isStatusMessage(addressFound)) {
        dispatchSnackbarMessage(addressFound);
        return;
      }
      if (isValidAddress(addressFound)) {
        dispatchSnackbarMessage(errorMessage(`The name "${myName}" is taken!`));
        return;
      }
      dispatchSnackbarMessage(infoMessage(`The name "${myName}" is not taken. Try to save it...`));
      await wrap(`Saving "${myName}"`, () => uniqueNameStore.setName(myName, publicAddress));
      dispatchSnackbarMessage(successMessage(`The blockchain is processing your name "${myName}"`));
    }
  }, [app, myName, uniqueNameStore]);

  const removeMyName = useCallback(async () => {
    const { wrap, dispatchSnackbarMessage } = app;
    const { web3, publicAddress } = app.web3Session || {};
    if (wrap && web3 && publicAddress && uniqueNameStore) {
      const res = await wrap(`Try to remove my name...`, () => uniqueNameStore.unSetName(publicAddress));
      if (isStatusMessage(res)) {
        dispatchSnackbarMessage(res);
        return;
      }
      dispatchSnackbarMessage(successMessage(`The blockchain is removing the name.`));
      setSavedName('');
      setMyName('');
    }
  }, [app, uniqueNameStore]);

  useEffect(() => {
    getMyName().catch(console.error);
  }, [getMyName]);

  if (!publicAddress || !web3) {
    return <Web3NotInitialized />;
  }
  if (!uniqueNameStore) {
    return (
      <StatusMessageElement statusMessage={warningMessage(`No contract found for ${ContractName.UNIQUE_NAME_STORE}`)} />
    );
  }

  return (
    <Stack spacing={2}>
      <LDBox>
        <ReactMarkdown>{`
# Your Unique Name

Here you can save a unique name for your address. The address will be seen by everybody who likes to 
resolve your address with the unique name.

You can:

- *save*: Save the new or changed name to the blockchain
- *refresh*: Refresh - reading from the blockchain - your saved name
- *remove*: Remove your name from the blockchain.
- *find name*: Read the name of a given address from the blockchain.
- *find address*: Read the address from a given name - if it is taken.
    
`}</ReactMarkdown>
      </LDBox>

      <Divider key={'my-stuff-divider'} />

      <Grid key={'my-stuff-grid'} container justifyContent="flex-start" alignItems="center" spacing={6}>
        <Grid key={'public-address-label'} item sm={2}>
          <Box sx={{ fontWeight: 600 }}>Your Address</Box>
        </Grid>
        <Grid key={'public-address'} item sm={9}>
          <AddressBoxWithCopy value={publicAddress} />
        </Grid>

        <Grid key={'my-name-label'} item sm={2}>
          <Box sx={{ fontWeight: 600 }}>My Unique Name</Box>
        </Grid>
        <Grid key={'my-name'} item sm={9}>
          <TextField
            placeholder={'Your unique name'}
            value={myName}
            onChange={(e) => setMyName(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid key={'buttons'} item sm={9}>
          <Button key={'save'} disabled={!myName || myName === savedName} onClick={saveMyName}>
            Save
          </Button>
          <Button key={'refresh'} disabled={myName === savedName} onClick={getMyName}>
            Refresh
          </Button>
          <Button key={'remove'} disabled={!savedName} onClick={removeMyName}>
            Remove
          </Button>
        </Grid>
      </Grid>

      <Divider key={'find-divider'} />

      <Grid key={'find-grid'} container justifyContent="flex-start" alignItems="center" spacing={6}>
        <Grid key={'search-label'} item sm={2}>
          <Box sx={{ fontWeight: 600 }}>Search by Name/Address</Box>
        </Grid>
        <Grid key={'search-value'} item sm={9}>
          <TextField
            placeholder={'Address or Name'}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid key={'buttons'} item sm={9}>
          <Button
            key={'find-name'}
            disabled={!isValidAddress(searchValue)}
            onClick={async () => {
              if (!wrap || !isValidAddress(searchValue)) {
                dispatchSnackbarMessage(errorMessage('The search value is not an address!'));
                return;
              }
              const name = await wrap(`Reading name for address ${searchValue}`, () =>
                uniqueNameStore.getName(searchValue)
              );
              if (isStatusMessage(name)) {
                dispatchSnackbarMessage(name);
                return;
              }
              if (!name) {
                dispatchSnackbarMessage(successMessage(`No name saved for "${searchValue}"`));
                return;
              }
              dispatchSnackbarMessage(successMessage(`Found name: "${name}"`));
            }}
          >
            Find name
          </Button>
          <Button
            key={'find-address'}
            disabled={!searchValue}
            onClick={async () => {
              if (!wrap || !searchValue) {
                return;
              }
              const address = await wrap(`Reading name for address ${searchValue}`, () =>
                uniqueNameStore.getAddress(searchValue, publicAddress)
              );
              if (isStatusMessage(address)) {
                dispatchSnackbarMessage(address);
                return;
              }
              if (!isValidAddress(address)) {
                dispatchSnackbarMessage(successMessage(`No address found for name "${searchValue}"`));
                return;
              }
              dispatchSnackbarMessage(successMessage(`Found address: "${address}"`));
            }}
          >
            Find address
          </Button>
        </Grid>
      </Grid>
    </Stack>
  );
}

function isValidAddress(s: string | null | undefined): boolean {
  if (!s) {
    return false;
  }
  try {
    const n = BigInt(s);
    return n !== BigInt(0);
  } catch (e) {
    return false;
  }
}
