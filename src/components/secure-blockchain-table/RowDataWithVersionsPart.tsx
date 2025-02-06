import { DataRowEntry, SBTManager } from '../../contracts/secure-blockchain-table/SecureBlockchainTable-support';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { infoMessage, isStatusMessage, StatusMessage } from '../../types';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableHead,
  TextField
} from '@mui/material';
import { TableRowComp } from '../common/TableRowComp';
import moment from 'moment/moment';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import { AddressBoxWithCopy } from '../common/AddressBoxWithCopy';
import { Base64Display } from '../common/Base64Display';
import { useAppContext } from '../AppContextProvider';

export function RowDataWithVersionsPart({
  sbtManager,
  editable
}: Readonly<{ sbtManager: SBTManager; editable: boolean }>) {
  const { wrap } = useAppContext();

  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [data, setData] = useState<DataRowEntry[][]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [newRow, setNewRow] = useState(-1);

  const refreshData = useCallback(() => {
    wrap(`Reading All Data...`, async () => {
      const data = await sbtManager.getRowDataWithVersions();
      if (isStatusMessage(data)) {
        setStatusMessage(data);
      } else {
        setData(data);
      }
    }).catch(console.error);
  }, [wrap, sbtManager]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const content = (
    <Stack>
      {data.length ? (
        <Table>
          <TableHead>
            <TableRowComp elements={['Row', 'Author', 'Content', 'Status', 'Version', 'Created', 'Actions']} />
          </TableHead>
          <TableBody>
            {data.map((versions, index) => {
              //return <pre>{JSON.stringify(versions || '-')}</pre>;
              const { userAddress, content, created, status, rowIndex, version = -2 } = versions[versions.length - 1];
              return (
                <TableRowComp
                  key={content + index}
                  elements={[
                    rowIndex + 1,
                    <AddressBoxWithCopy key={'user-address'} value={userAddress} reduced={true} useNames={true} />,
                    <Base64Display key={'display'} value={content} />,
                    status,
                    version + 1,
                    moment(1000 * created).format('YYYY-MM-DD HH:mm'),
                    content.startsWith('enc-') ? (
                      <Button
                        onClick={() =>
                          wrap('Decrypting data...', async () => {
                            const decContent = await sbtManager.decryptEncContent(content);
                            if (isStatusMessage(decContent)) {
                              setStatusMessage(decContent);
                              return;
                            }
                            setData((arr) =>
                              arr.map((rowData, row) =>
                                rowData.map((colData, col) => {
                                  if (row === index && col === rowData.length - 1) {
                                    return { ...colData, content: decContent };
                                  }
                                  return colData;
                                })
                              )
                            );
                          })
                        }
                      >
                        Decrypt
                      </Button>
                    ) : (
                      ''
                    )
                  ]}
                />
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <StatusMessageElement statusMessage={infoMessage('No Data Entries')} />
      )}
      {editable ? (
        <Stack
          key={'edit-row-entry'}
          direction={'row'}
          justifyContent="space-between"
          alignItems="baseline"
          spacing={1}
          sx={{ margin: '1em 0' }}
        >
          <TextField
            disabled={!editable}
            size={'small'}
            multiline={true}
            maxRows={6}
            label={'New Entry'}
            onChange={(e) => setNewEntry(e.target.value)}
            value={newEntry}
            fullWidth={true}
          />
          <FormControl sx={{ minWidth: 120 }} size={'small'}>
            <InputLabel id={'row-index'}>{'Add To...'}</InputLabel>
            <Select
              variant="outlined"
              autoWidth={true}
              key={'row-index'}
              label={'row-index'}
              value={newRow}
              onChange={(e) => setNewRow(e.target.value as number)}
            >
              <MenuItem key={'new'} value={-1}>
                New
              </MenuItem>
              {new Array(data.length + 1).fill(0).map((_, i) => (
                <MenuItem key={i + 'index'} value={i}>
                  {`Row ${i + 1}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            key={'save'}
            sx={{ whiteSpace: 'nowrap' }}
            onClick={() =>
              wrap(`Encrypt & save a new Row`, async () => {
                const encContent = await sbtManager.encryptContent(newEntry);
                if (isStatusMessage(encContent)) {
                  setStatusMessage(encContent);
                  return;
                }
                let res;
                if (newRow < 0) {
                  res = await sbtManager.addRowData(encContent);
                } else {
                  res = await sbtManager.setDataRow(newRow, encContent);
                }
                if (isStatusMessage(res)) {
                  setStatusMessage(res);
                } else {
                  refreshData();
                }
              }).catch(console.error)
            }
          >
            Add Entry
          </Button>
        </Stack>
      ) : (
        <StatusMessageElement statusMessage={infoMessage('Data is not editable')} />
      )}

      <StatusMessageElement statusMessage={statusMessage} onClose={() => setStatusMessage(undefined)} />
    </Stack>
  );

  return (
    <CollapsiblePanel
      collapsed={true}
      title={`Row Data`}
      toolbar={[
        <Button key={'refresh'} onClick={refreshData}>
          Refresh
        </Button>
      ]}
      content={content}
    />
  );
}
