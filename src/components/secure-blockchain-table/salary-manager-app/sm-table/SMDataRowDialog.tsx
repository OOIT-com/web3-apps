import { SMDataRow } from './types';
import DialogTitle from '@mui/material/DialogTitle';
import { FC } from 'react';
import Dialog from '@mui/material/Dialog';
import { NotifyFun } from '../../../../types';
import DialogContent from '@mui/material/DialogContent';
import { Table, TableBody } from '@mui/material';
import TableRowComp from '../../../common/TableRowComp';
import { AddressBoxWithCopy } from '../../../common/AddressBoxWithCopy';
import Button from '@mui/material/Button';
import { UpdateRowFun } from './SMTable';
import moment from 'moment';

export const SMDataRowDialog: FC<{ data: SMDataRow; done: NotifyFun; owner?: string; action?: UpdateRowFun }> = ({
  data,
  done,
  action,
  owner = ''
}) => {
  const { firstName, lastName, updatedFields, version, userAddress, rowIndex, created } = data;
  return (
    <Dialog open={true} onClose={() => done()} fullWidth={true}>
      <DialogTitle>{`Details for ${firstName} ${lastName}`}</DialogTitle>
      <DialogContent>
        <Table>
          <TableBody>
            <TableRowComp key={'dirty'} elements={['Save needed?', `${!!updatedFields}`]} />
            <TableRowComp key={'data-version'} elements={['Data Version', version > -1 ? `${version}` : 'initial']} />
            <TableRowComp key={'row-index'} elements={['Row Index', `${rowIndex}`]} />
            <TableRowComp
              key={'created'}
              elements={['Created', `${created ? moment(created * 1000).format('DD-MMMM-YYYY HH:mm') : '-'}`]}
            />
            <TableRowComp
              key={'user-address'}
              elements={[
                'User',
                <AddressBoxWithCopy key={'user-address'} value={userAddress || owner} useNames={true} />
              ]}
            />
            {Object.keys(data.updatedFields || {}).length > 0 && action && (
              <TableRowComp
                key={'reset'}
                elements={[
                  'Reset this Row Data?',
                  <Button
                    key={'reset'}
                    onClick={() => {
                      action('reset', data.userId, 'userId', data.userId);
                      done();
                    }}
                  >
                    reset
                  </Button>
                ]}
              />
            )}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};
