import { NotifyFun } from '../../types';
import { FC, useCallback, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { Box, Button, Stack, TextField } from '@mui/material';
import { isAddress } from 'ethers';
import { displayAddress } from '../../utils/misc-util';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { useAppContext } from '../AppContextProvider';
import { AddressBoxWithCopy } from '../common/AddressBoxWithCopy';
import { UniversalNameStore } from '../../contracts/universal-name-store/UniversalNameStore-support';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import { CopyBox } from '../common/CopyBox';
import {isStatusMessage, StatusMessage, successMessage, warningMessage} from "../../utils/status-message";

type SearchResult = { labelValue: string; resultValue: string };
export const NameRetrievalDialog: FC<{ done: NotifyFun; universalNameStore: UniversalNameStore }> = ({
  universalNameStore,
  done
}) => {
  const { wrap } = useAppContext();

  const [searchValue, setSearchValue] = useState('');
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [searchResult, setSearchResult] = useState<SearchResult>();

  const searchFun = useCallback(
    async () =>
      wrap(
        `Retrieve from Universal Naming Service. ${
          isAddress(searchValue) ? 'Address' : 'Name'
        } for : ${searchValue}...`,
        async () => {
          setSearchResult(undefined);
          setStatusMessage(undefined);

          let entry: string | StatusMessage;
          const addressSearch = isAddress(searchValue);
          if (addressSearch) {
            entry = await universalNameStore.getName(searchValue);
          } else {
            entry = await universalNameStore.getAddressByName(searchValue);
          }
          if (isStatusMessage(entry)) {
            setStatusMessage(entry);
          } else if (entry) {
            setSearchResult({ labelValue: searchValue, resultValue: entry });
            setStatusMessage(successMessage(`Found ${addressSearch ? entry : displayAddress(entry)}!`));
          } else {
            setStatusMessage(warningMessage(`No entry found for ${searchValue}!`));
          }
        }
      ),
    [searchValue, universalNameStore, wrap]
  );

  const clearFun = useCallback(() => {
    setSearchValue('');
    setSearchResult(undefined);
    setStatusMessage(undefined);
  }, []);

  return (
    <Dialog open={true} onClose={() => done()} maxWidth={'md'} fullWidth>
      <DialogTitle>Retrieve By Name or Address</DialogTitle>
      <DialogContent>
        <CollapsiblePanel
          collapsible={false}
          level={'fourth'}
          title={'The retrieval does not support wildcards.'}
          toolbar={[
            <Button key={'retrieve'} disabled={!searchValue} onClick={searchFun}>
              Retrieve
            </Button>,
            <Button key={'clear'} onClick={clearFun}>
              Clear
            </Button>,
            <Button key={'close'} onClick={() => done()}>
              Close
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
                  searchFun();
                }
              }}
            />
          </Stack>
          <StatusMessageElement statusMessage={statusMessage} />
          <DisplayResultValue key={'result-value'} searchResult={searchResult} />
        </CollapsiblePanel>
      </DialogContent>
    </Dialog>
  );
};

type DisplayResultValueProps = {
  searchResult?: SearchResult;
};
const DisplayResultValue: FC<DisplayResultValueProps> = ({ searchResult }) => {
  if (!searchResult) {
    return <></>;
  }
  const { labelValue, resultValue } = searchResult;
  let title: string;
  let dipComp: JSX.Element;
  if (isAddress(resultValue)) {
    title = 'The following Address was found!';
    dipComp = <AddressBoxWithCopy key={'result-address'} value={resultValue} reduced={false} label={labelValue} />;
  } else {
    title = `The following Name was found for Address: ${displayAddress(labelValue)}:`;
    dipComp = (
      <CopyBox
        key={'result-value'}
        copyValue={resultValue}
        copyBoxSx={{ border: 'solid lightgray 1px', padding: '0.4em' }}
      >
        {resultValue}
      </CopyBox>
    );
  }
  return (
    <Stack sx={{ padding: '1em' }} spacing={2}>
      <Box key={'label'} sx={{ fontWeight: 'bold' }}>
        {title}
      </Box>
      {dipComp}
    </Stack>
  );
};
