import { Table, TableBody, TableHead } from '@mui/material';
import { TableRowCompProps } from './TableRowComp';
import { ReactElement } from 'react';

type TableRowsUiElement = ReactElement<TableRowCompProps>;

export function TableComp({ header, content }: { header?: TableRowsUiElement; content: TableRowsUiElement[] }) {
  if (header) {
    return (
      <Table>
        <TableHead>{header}</TableHead>
        <TableBody>{content}</TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <TableBody>{content}</TableBody>
    </Table>
  );
}
