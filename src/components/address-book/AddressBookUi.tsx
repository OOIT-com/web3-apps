import { Button, Stack, Table, TableBody, TableHead } from '@mui/material';
import * as React from 'react';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { infoMessage, isStatusMessage, StatusMessage } from '../../types';
import TableRowComp from '../common/TableRowComp';

import { AddressBoxWithCopy } from '../common/AddressBoxWithCopy';
import { AddressDataEditDialog } from './AddressDataEditDialog';
import { AddressDataRetrieveDialog } from './AddressDataRetrieveDialog';
import { AddressData, getAddressBook } from '../../contracts/address-book/AddressBook-support';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { NoContract } from '../common/NoContract';

import { ContractName } from '../../contracts/contract-utils';
import { reloadAddressData } from '../init-dapps';
import { useAppContext } from '../AppContextProvider';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import addressBookImg from '../images/address-book.png';
import { AppTopTitle } from '../common/AppTopTitle';

export function AddressBookUi() {
  const { wrap, web3Session, addressData = [], setAddressData } = useAppContext();
  const { web3, publicAddress } = web3Session || {};
  const [owner, setOwner] = useState('');
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [addressData4Edit, setAddressData4Edit] = useState<'new' | AddressData>();
  const [startRetrieval, setStartRetrieval] = useState(false);

  const refreshData = useCallback(async () => {
    const addressBook = getAddressBook();
    if (web3 && addressBook) {
      const sm = await wrap('Loading Address Book Data...', () => reloadAddressData(setAddressData));
      if (sm) {
        setStatusMessage(sm);
        return;
      }
      const owner0 = await addressBook.owner();
      if (isStatusMessage(owner0)) {
        setStatusMessage(owner0);
      } else {
        setOwner(owner0);
      }
    }
  }, [setAddressData, wrap, web3]);

  useEffect(() => {
    refreshData().catch(console.error);
  }, [refreshData]);

  if (!web3 || !publicAddress) {
    return <StatusMessageElement statusMessage={infoMessage('Loading ...')} />;
  }

  const isOwner = publicAddress === owner;
  const tableHeader = [`Nr`, 'Name', 'Email', 'Phone', 'Account'];
  if (isOwner) {
    tableHeader.push('Actions');
  }
  const addressBook = getAddressBook();
  if (!addressBook) {
    return <NoContract name={ContractName.ADDRESS_BOOK} />;
  }

  const toolbar = [
    <Button key={'search'} onClick={() => setStartRetrieval(true)}>
      Retrieval
    </Button>
  ];
  if (isOwner) {
    toolbar.push(
      <Button key={'add'} onClick={() => setAddressData4Edit('new')}>
        Add
      </Button>
    );
  }
  toolbar.push(
    <Button key={'refresh'} onClick={() => wrap('Refresh Data...', () => refreshData())}>
      Refresh
    </Button>
  );

  return (
    <Fragment>
      <CollapsiblePanel
        level={'top'}
        collapsible={true}
        collapsed={false}
        title={<AppTopTitle title={'Address Book'} avatar={addressBookImg} />}
        toolbar={toolbar}
        content={[
          <StatusMessageElement
            key={'status-message'}
            statusMessage={statusMessage}
            onClose={() => setStatusMessage(undefined)}
          />,
          <Table key={'table'}>
            <TableHead>
              <TableRowComp elements={tableHeader} />
            </TableHead>
            <TableBody>
              {addressData.map((cd) => {
                const elements = [
                  cd.index !== undefined ? `Nr ${cd.index + 1}` : '-',
                  cd.name,
                  cd.email,
                  cd.phone,
                  <AddressBoxWithCopy key={'user-address'} value={cd.userAddress} useNames={false} />
                ];
                if (isOwner) {
                  elements.push(
                    <Stack key={'actions'} direction={'row'} spacing={1}>
                      <Button key={'edit'} onClick={() => setAddressData4Edit(cd)}>
                        edit
                      </Button>
                      <Button
                        key={'remove'}
                        onClick={async () =>
                          wrap(`Remove Address: ${cd.name}`, async () => {
                            await addressBook.remove(cd.userAddress, publicAddress);
                            await refreshData();
                          })
                        }
                      >
                        remove
                      </Button>
                    </Stack>
                  );
                }
                return <TableRowComp key={cd.userAddress} elements={elements} />;
              })}
            </TableBody>
          </Table>
        ]}
      />

      {addressData4Edit && (
        <AddressDataEditDialog
          addressDataIn={addressData4Edit}
          done={(refreshNeeded: boolean) => {
            setAddressData4Edit(undefined);
            if (refreshNeeded) {
              refreshData();
            }
          }}
        />
      )}
      {startRetrieval && (
        <AddressDataRetrieveDialog
          done={() => setStartRetrieval(false)}
          openForEdit={
            isOwner
              ? (addressData: AddressData) => {
                  setStartRetrieval(false);
                  setAddressData4Edit(addressData);
                }
              : undefined
          }
        />
      )}
    </Fragment>
  );
}
