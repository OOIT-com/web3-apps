import {
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme
} from '@mui/material';
import { ChangeEvent, FC, Fragment, ReactNode, useEffect, useMemo, useState } from 'react';
import { isStatusMessage, StatusMessage } from '../../types';
import { KeyBlockEntry } from './KeyBlockEntryUi';
import { EmptyItem, getKeyBlock, SecretVaultEntry } from '../../contracts/key-block/KeyBlock-support';
import Web3 from 'web3';
import { getNetworkInfo } from '../../network-info';
import { display64 } from '../../utils/misc-util';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { NoContract } from '../common/NoContract';
import { useAppContext, WrapFun } from '../AppContextProvider';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import TextField from '@mui/material/TextField';
import { grey } from '@mui/material/colors';

const KeyBlockUi: FC = () => {
  const { wrap, web3Session } = useAppContext();
  const { publicAddress, networkId = 0, web3 } = web3Session || {};
  const theme = useTheme();
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [rows, setRows] = useState<SecretVaultEntry[]>([]);
  const [editItem, setEditItem] = useState(EmptyItem);
  const [filterValue, setFilterValue] = useState('');
  const [openEditor, setOpenEditor] = useState(false);

  useEffect(() => {
    const load = async () => {
      setStatusMessage(await refreshFromBlockchain(wrap, publicAddress, networkId, web3, setRows));
    };
    load().catch(console.error);
  }, [wrap, web3, publicAddress, networkId]);

  const content = useMemo(() => {
    const content: ReactNode[] = [
      <StatusMessageElement
        key={'status-message'}
        statusMessage={statusMessage}
        onClose={() => setStatusMessage(undefined)}
      />,
      <Stack
        key={'buttons'}
        direction={'row'}
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        mb={'1em'}
        sx={{ backgroundColor: theme.palette.mode === 'dark' ? grey['900'] : grey.A100 }}
      >
        <TextField
          size={'small'}
          label={'Name filter'}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setFilterValue(e.target.value)}
          value={filterValue}
        />
        <Button
          onClick={() => {
            setEditItem({ ...EmptyItem });
            setOpenEditor(true);
          }}
        >
          New Entry
        </Button>
      </Stack>,
      <TableContainer key={'table'} component={Paper} elevation={0}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell key={'index'}>Nr</TableCell>
              <TableCell key={'inserted'}>Inserted</TableCell>
              <TableCell key={'name'}>Name</TableCell>
              <TableCell key={'secret'}>Secret (encrypted)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .filter((row) => row.name.includes(filterValue))
              .map((row) => (
                <TableRow
                  sx={{ cursor: 'pointer' }}
                  hover={true}
                  onClick={() => {
                    setEditItem({ ...row });
                    setOpenEditor(true);
                  }}
                  key={row.index}
                >
                  <TableCell key={'index'}>{row.index + 1}</TableCell>
                  <TableCell key={'inserted'}>{row.inserted}</TableCell>
                  <TableCell key={'name'}>{row.name}</TableCell>
                  <TableCell key={'secret'}>{display64(row.secret)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
          <Button
            onClick={async () => {
              setStatusMessage(await refreshFromBlockchain(wrap, publicAddress, networkId, web3, setRows));
            }}
          >
            Refresh
          </Button>
        </Stack>
      </TableContainer>
    ];

    return content;
  }, [statusMessage, theme.palette.mode, filterValue, rows, wrap, publicAddress, networkId, web3]);

  const { name } = getNetworkInfo(networkId);

  const keyBlock = getKeyBlock();
  if (!keyBlock) {
    return <NoContract name={name} />;
  }

  if (statusMessage) {
    return <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />;
  }

  return (
    <Fragment>
      <CollapsiblePanel level={'top'} collapsible={false} title={'Welcome to the Secret Vault'} content={content} />
      <KeyBlockEntry
        key={'key-block-entry'}
        item={editItem}
        open={openEditor}
        done={() => {
          setOpenEditor(false);
        }}
        update={async () => {
          setStatusMessage(await refreshFromBlockchain(wrap, publicAddress, networkId, web3, setRows));
        }}
      />
    </Fragment>
  );
};
export default KeyBlockUi;

async function refreshFromBlockchain(
  wrap: WrapFun,
  publicAddress: string | undefined,
  networkId: number,
  web3: Web3 | undefined,
  setRows: (items: SecretVaultEntry[]) => void
): Promise<StatusMessage | undefined> {
  const keyBlockApi = getKeyBlock();
  if (!publicAddress || !web3 || !networkId || !keyBlockApi) {
    return;
  }
  setRows([]);
  return await wrap('Reading entries...', async () => {
    const len = await keyBlockApi.len(publicAddress);
    if (isStatusMessage(len)) {
      return len;
    }
    const items: SecretVaultEntry[] = [];
    for (let index = 0; index < len; index++) {
      const entry = await keyBlockApi.get(publicAddress, index);
      if (isStatusMessage(entry)) {
        return entry;
      } else {
        const item: SecretVaultEntry = { index, name: entry[0], secret: entry[1], inserted: entry[2] };
        items.push(item);
      }
    }
    setRows(items);
  });
}
