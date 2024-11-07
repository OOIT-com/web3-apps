import { SMInitialData } from '../types';
import { ReactNode, useState } from 'react';
import { SMTable } from './SMTable';
import { Stack } from '@mui/material';
import { StatusMessageElement } from '../../../common/StatusMessageElement';
import { updateCompensationComparisons } from './sm-table-col-def';

export function InitialDataDisplay({
  initialData
}: Readonly<{
  initialData?: string;
}>) {
  const [messagesClosed, setMessagesClosed] = useState(false);

  const content: ReactNode[] = [];

  if (initialData) {
    const smData = JSON.parse(initialData) as SMInitialData;
    const { smTableRows, prevYear, newYear } = smData;
    const dataRows = smTableRows.map((dataRow) => updateCompensationComparisons(dataRow));
    content.push(<SMTable key={'sm-table'} dataRows={dataRows} newYear={newYear} prevYear={prevYear} />);

    if (!messagesClosed) {
      content.push(
        <Stack key={'messages'}>
          {smData.loadMessages?.map((sm, index) => (
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
