import { ReactNode } from 'react';
import { TableCell, TableRow } from '@mui/material';

export type AlignName = 'inherit' | 'left' | 'center' | 'right' | 'justify';
export type AlignType = AlignName | AlignName[];
export type TableRowCompProps = {
  elements: (string | number | boolean | ReactNode)[];
  align?: AlignType;
  colspan?: number[];
};
export default function TableRowComp({ elements, align, colspan = [] }: TableRowCompProps) {
  return (
    <TableRow>
      {elements.map((e, i) => (
        <TableCell key={'' + i} align={getAlign(i, align)} colSpan={colspan[i]}>
          {e}
        </TableCell>
      ))}
    </TableRow>
  );
}

function getAlign(index: number, align?: AlignType): AlignName {
  if (!align) {
    return 'left';
  }
  if (Array.isArray(align)) {
    return align[index] || 'left';
  }
  return align;
}
