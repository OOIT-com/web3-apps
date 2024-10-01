import { InitialData } from './types';
import { ReactNode, useState } from 'react';
import { SMTable } from './sm-table/SMTable';
import { Stack } from '@mui/material';
import { StatusMessageElement } from '../../common/StatusMessageElement';
import { updateCompensationComparisons } from './sm-table/sm-table-col-def';

export function InitialDataDisplay({
  initialData
}: Readonly<{
  initialData?: InitialData;
}>) {
  const [messagesClosed, setMessagesClosed] = useState(false);

  const content: ReactNode[] = [];

  if (initialData) {
    const { smTableRows, prevYear, newYear } = initialData;
    const dataRows = smTableRows.map((dataRow) => updateCompensationComparisons(dataRow));
    content.push(<SMTable key={'sm-table'} dataRows={dataRows} newYear={newYear} prevYear={prevYear} />);

    if (!messagesClosed) {
      content.push(
        <Stack key={'messages'}>
          {initialData.loadMessages?.map((sm, index) => (
            <StatusMessageElement
              key={sm.userMessage}
              statusMessage={sm}
              onClose={index === 0 ? () => setMessagesClosed(true) : undefined}
            />
          ))}
        </Stack>
      );
    }
  }

  return <Stack>{content}</Stack>;
}
