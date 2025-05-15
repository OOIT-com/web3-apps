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
import { ChangeEvent, FC, Fragment, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { SecretVaultEntryUi } from './SecretVaultEntryUi';
import { EmptyItem, getKeyBlock, SecretVaultEntry } from '../../contracts/key-block/KeyBlock-support';
import { getNetworkInfo } from '../../network-info';
import { display64 } from '../../utils/misc-util';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { NoContract } from '../common/NoContract';
import { useAppContext } from '../AppContextProvider';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import TextField from '@mui/material/TextField';
import { grey } from '@mui/material/colors';
import secretVaultPng from '../images/secret-vault.png';
import { AppTopTitle } from '../common/AppTopTitle';
import { ButtonPanel } from '../common/ButtonPanel';
import { SecretVaultDownloadDialog } from './SecretVaultDownloadDialog';
import {isStatusMessage, StatusMessage} from "../../utils/status-message";

const SecretVaultUi: FC = () => {
  const { wrap, web3Session } = useAppContext();
  const { publicAddress, networkId = 0, web3 } = web3Session || {};
  const theme = useTheme();
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [secretVaultEntries, setSecretVaultEntries] = useState<SecretVaultEntry[]>([]);
  const [editItem, setEditItem] = useState(EmptyItem);
  const [filterValue, setFilterValue] = useState('');
  const [openEditor, setOpenEditor] = useState(false);
  const [openDownloadDialog, setOpenDownloadDialog] = useState(false);

  const refreshData = useCallback(async () => {
    const keyBlock = getKeyBlock();
    if (!publicAddress || !web3 || !networkId || !keyBlock) {
      return;
    }
    setStatusMessage(undefined);
    const items = await wrap('Loading Secret Vault Entries...', () => keyBlock.getAllEntries(publicAddress));
    if (isStatusMessage(items)) {
      setStatusMessage(items);
    } else {
      setSecretVaultEntries(items);
    }
  }, [networkId, publicAddress, web3, wrap]);

  useEffect(() => {
    refreshData().catch(console.error);
  }, [refreshData]);

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
          key={'name-filter'}
          size={'small'}
          label={'Name filter'}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setFilterValue(e.target.value)}
          value={filterValue}
        />
        <ButtonPanel key={'button-panel'}>
          <Button
            key={'new-entry'}
            onClick={() => {
              setEditItem({ ...EmptyItem });
              setOpenEditor(true);
            }}
          >
            New Entry
          </Button>

          <Button key={'download'} onClick={() => setOpenDownloadDialog(true)}>
            Download Entries...
          </Button>

          <Button key={'refresh'} onClick={refreshData}>
            Refresh
          </Button>
        </ButtonPanel>
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
            {secretVaultEntries
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
      </TableContainer>
    ];

    return content;
  }, [statusMessage, theme.palette.mode, filterValue, refreshData, secretVaultEntries]);

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
      <CollapsiblePanel
        level={'top'}
        collapsible={false}
        title={<AppTopTitle avatar={secretVaultPng} title={'My Secret Vault'} />}
        content={content}
      />
      <SecretVaultEntryUi
        key={'key-block-entry'}
        item={editItem}
        open={openEditor}
        done={() => {
          setOpenEditor(false);
        }}
        update={() => refreshData().catch(console.error)}
      />

      <SecretVaultDownloadDialog
        key={'secret-vault-download-dialog'}
        open={openDownloadDialog}
        keyBlock={keyBlock}
        done={() => {
          setOpenDownloadDialog(false);
        }}
      />
    </Fragment>
  );
};
export default SecretVaultUi;
