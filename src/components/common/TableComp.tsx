import { Table, TableBody, TableHead } from '@mui/material';
import { TableRowCompProps } from './TableRowComp';
import { FC, PropsWithChildren, ReactElement } from 'react';

type TableRowsUiElement = ReactElement<TableRowCompProps>;

export const TableComp: FC<
  PropsWithChildren<{
    header?: TableRowsUiElement;
    content?: TableRowsUiElement[];
  }>
> = ({ header, content, children }) => {
  if (header) {
    return (
      <Table>
        <TableHead>{header}</TableHead>
        <TableBody>{content || children}</TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <TableBody>{content || children}</TableBody>
    </Table>
  );
};
