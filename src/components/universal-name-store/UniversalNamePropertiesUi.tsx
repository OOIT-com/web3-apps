import * as React from 'react';
import { FC, useCallback, useState } from 'react';
import { NotifyFun } from '../../types';

import { StatusMessageElement } from '../common/StatusMessageElement';
import { ContractName } from '../../contracts/contract-utils';
import { useAppContext } from '../AppContextProvider';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import {
  UniversalNameProperty,
  UniversalNameStore
} from '../../contracts/universal-name-store/UniversalNameStore-support';
import { Web3NotInitialized } from '../common/Web3NotInitialized';
import { Box, Stack, TextField } from '@mui/material';
import Button from '@mui/material/Button';
import { isAddress } from 'ethers';
import { AddressBoxWithCopy } from '../common/AddressBoxWithCopy';
import { TableComp } from '../common/TableComp';
import { TableRowComp } from '../common/TableRowComp';
import { ButtonPanel } from '../common/ButtonPanel';
import { AttributeDef, PRecord } from '../../ui-factory/types';
import { AttributeTableUi } from '../../ui-factory/AttributeTableUi';
import {isStatusMessage, StatusMessage, warningMessage} from "../../utils/status-message";

const attDefs: AttributeDef[] = [{ name: 'key' }, { name: 'value' }];

type NameProperties = { properties: UniversalNameProperty[]; name: string; address: string; ownerShip: string };
export const UniversalNamePropertiesUi: FC<{ universalNameStore: UniversalNameStore }> = ({ universalNameStore }) => {
  const app = useAppContext();
  const { wrap } = app;
  const { web3, publicAddress } = app.web3Session || {};

  const [searchValue, setSearchValue] = useState('');

  const [nameProperties, setNameProperties] = useState<NameProperties>();

  const [additional, setAdditional] = useState<PRecord>();

  const [statusMessage, setStatusMessage] = useState<StatusMessage>();

  const refreshNameProperties = useCallback(async () => {
    setNameProperties(undefined);
    setStatusMessage(undefined);
    const res = await wrap(`Retrieve Name Properties...`, async () => {
      let entry: string | StatusMessage;
      const addressSearch = isAddress(searchValue);
      if (addressSearch) {
        entry = await universalNameStore.getName(searchValue);
      } else {
        entry = await universalNameStore.getAddressByName(searchValue);
      }
      if (isStatusMessage(entry)) {
        return entry;
      }
      if (!entry) {
        return warningMessage(`No entry found for ${searchValue}!`);
      }

      const address = (addressSearch ? searchValue : entry).toLowerCase();
      const name = addressSearch ? entry : searchValue;

      const ownerShip = publicAddress === address ? publicAddress : await universalNameStore.getOwnership(address);
      if (isStatusMessage(ownerShip)) {
        return ownerShip;
      }

      const properties = await universalNameStore.getProperties(address);
      if (isStatusMessage(properties)) {
        return properties;
      }

      return { name, address, ownerShip, properties };
    });
    if (isStatusMessage(res)) {
      setStatusMessage(res);
    } else {
      setNameProperties(res);
    }
  }, [publicAddress, searchValue, universalNameStore, wrap]);

  const saveAdditional = useCallback(async () => {
    if (!nameProperties?.name || !additional || !additional.key || !additional.value) {
      return;
    }
    setStatusMessage(undefined);
    const { key, value } = additional;
    const res = await wrap(`Save Name Property (${key})...`, async () => {
      const setValueRes = await universalNameStore.setValue(nameProperties.name, key.toString(), value.toString());
      if (isStatusMessage(setValueRes)) {
        return setValueRes;
      } else {
        refreshNameProperties();
      }
    });
    if (isStatusMessage(res)) {
      setStatusMessage(res);
    } else {
      setNameProperties(res);
    }
  }, [additional, nameProperties, refreshNameProperties, universalNameStore, wrap]);

  const removeValue = useCallback(
    async (key: string) => {
      if (!nameProperties?.name || !nameProperties.properties) {
        return;
      }
      setStatusMessage(undefined);
      const res = await wrap(`Remove Property (${key})...`, async () => {
        const removeValueRes = await universalNameStore.removeValue(nameProperties.name, key.toString());
        if (isStatusMessage(removeValueRes)) {
          return removeValueRes;
        } else {
          refreshNameProperties();
        }
      });
      if (isStatusMessage(res)) {
        setStatusMessage(res);
      }
    },
    [nameProperties, refreshNameProperties, universalNameStore, wrap]
  );

  const clearFun = useCallback(() => {
    setSearchValue('');
    setNameProperties(undefined);
    setStatusMessage(undefined);
  }, []);

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

  return (
    <CollapsiblePanel
      collapsed={true}
      level={'second'}
      title={'Universal Name Properties'}
      toolbar={[
        <Button key={'retrieve'} disabled={!searchValue} onClick={refreshNameProperties}>
          Retrieve
        </Button>,
        <Button key={'clear'} onClick={clearFun}>
          Clear
        </Button>
      ]}
    >
      <Stack direction={'row'} spacing={2} sx={{ width: '30em', padding: '1em 0' }}>
        <TextField
          key={'resolveValue'}
          label={'Name or Address'}
          size={'small'}
          fullWidth={true}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              refreshNameProperties();
            }
          }}
        />
      </Stack>
      <StatusMessageElement statusMessage={statusMessage} />
      <DisplayNameProperties
        key={'result-value'}
        nameProperties={nameProperties}
        publicAddress={publicAddress}
        additional={additional}
        setAdditional={setAdditional}
        saveAdditional={saveAdditional}
        removeValue={removeValue}
      />
    </CollapsiblePanel>
  );
};

const DisplayNameProperties: FC<{
  nameProperties?: NameProperties;
  publicAddress: string;
  additional?: PRecord;
  setAdditional: (v?: PRecord) => void;
  saveAdditional: NotifyFun;
  removeValue: (key: string) => void;
}> = ({ nameProperties, publicAddress, additional, setAdditional, saveAdditional, removeValue }) => {
  if (!nameProperties) {
    return <></>;
  }

  const { address, name, properties, ownerShip } = nameProperties;
  const isOwner = publicAddress.toLowerCase() === ownerShip.toLowerCase();

  return (
    <Stack sx={{ padding: '1em' }} spacing={2}>
      <Box key={'label'} sx={{ fontWeight: 'bold' }}>
        {`Universal Name ${name} ${isOwner ? ' (Owner)' : ''}`}
      </Box>
      <AddressBoxWithCopy key={'address'} value={address} label={`Address for ${name}`} reduced={false} />
      <Box key={'label'} sx={{ fontWeight: 'bold' }}>
        {'Universal Name Properties'}
      </Box>
      {properties.length === 0 ? (
        <Box>Currently, no properties have been saved!</Box>
      ) : (
        <TableComp header={<TableRowComp key={'header'} elements={['Index', 'Key', 'Value', '']} />}>
          {properties.map(({ key, value, index }) => (
            <TableRowComp
              key={index}
              elements={[
                <Box key={'index'}>{index + 1}</Box>,
                <Box key={'key'}>{key}</Box>,
                <Box key={'value'}>{value}</Box>,
                isOwner ? (
                  <ButtonPanel key={'button-panel'}>
                    <Button key={'update'} onClick={() => setAdditional({ key, value, index })}>
                      update
                    </Button>
                    <Button key={'remove'} onClick={() => removeValue(key.toString())}>
                      remove
                    </Button>
                  </ButtonPanel>
                ) : (
                  <></>
                )
              ]}
            />
          ))}
        </TableComp>
      )}

      {isOwner && (
        <Stack key={'owner-section'} sx={{ background: '#2196f314' }}>
          {additional && <AttributeTableUi attributeDefs={attDefs} setData={setAdditional} data={additional} />}
          <ButtonPanel key={'button-panel'} mode={'right'}>
            {!additional && <Button onClick={() => setAdditional({ key: '', value: '' })}>Add New Property</Button>}
            {additional && (
              <Button key={'save'} onClick={saveAdditional}>
                Save Property
              </Button>
            )}
            {additional && (
              <Button key={'clear'} onClick={() => setAdditional(undefined)}>
                Clear
              </Button>
            )}
          </ButtonPanel>
        </Stack>
      )}
    </Stack>
  );
};
