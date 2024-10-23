import DialogTitle from '@mui/material/DialogTitle';
import { FC } from 'react';
import Dialog from '@mui/material/Dialog';
import { NotifyFun } from '../../../../types';
import DialogContent from '@mui/material/DialogContent';
import { Table, TableBody } from '@mui/material';
import { TableRowComp } from '../../../common/TableRowComp';
import { AddressBoxWithCopy } from '../../../common/AddressBoxWithCopy';
import Button from '@mui/material/Button';
import moment from 'moment';
import { GenDataRow, GenUpdateRowFun } from './gen-types';

export const GenDataRowDialog: FC<{ data: GenDataRow; done: NotifyFun; owner?: string; action?: GenUpdateRowFun }> = ({
  data,
  done,
  action,
  owner = ''
}) => {
  const { firstName, lastName, operationalFields } = data;
  const { version, userAddress, rowIndex, created } = data.operationalFields;
  return (
    <Dialog open={true} onClose={() => done()} fullWidth={true}>
      <DialogTitle>{`Details for ${firstName} ${lastName}`}</DialogTitle>
      <DialogContent>
        <Table>
          <TableBody>
            <TableRowComp key={'dirty'} elements={['Save needed?', `${!!operationalFields}`]} />
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
            {Object.keys(data.operationalFields || {}).length > 0 && action && (
              <TableRowComp
                key={'reset'}
                elements={[
                  'Reset this Row Data?',
                  <Button
                    key={'reset'}
                    onClick={() => {
                      action('reset', data.id.toString(), 'id', data.userId);
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
