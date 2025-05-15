import React, { FC, ReactNode } from 'react';
import { Alert, AlertTitle, Box } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import {StatusMessage} from "../../utils/status-message";

export type StatusMessageProps = {
  title?: JSX.Element | ReactNode;
  statusMessage?: StatusMessage;
  onClose: () => void; // (() => void)) | undefined;
};
export const StatusMessageDialog: FC<StatusMessageProps> = ({
  statusMessage,
  title = 'Status Message',
  onClose
}: StatusMessageProps): JSX.Element => {
  if (!statusMessage) {
    return <></>;
  }

  const list: React.ReactElement[] = [];
  if (statusMessage.userMessage) {
    list.push(<AlertTitle key={'user--message'}>{statusMessage.userMessage}</AlertTitle>);
  }
  if (statusMessage.systemMessage) {
    list.push(
      <Box key={'system-message'} sx={{ wordBreak: 'break-word' }}>
        {statusMessage.systemMessage}
      </Box>
    );
  }
  if (statusMessage.additionalSystemMessages) {
    statusMessage.additionalSystemMessages.forEach((additionalSystemMessage) =>
      list.push(
        <Box key={additionalSystemMessage} sx={{ wordBreak: 'break-word' }}>
          {additionalSystemMessage}
        </Box>
      )
    );
  }

  return (
    <Dialog open={true} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Alert severity={statusMessage.status}>{list}</Alert>
      </DialogContent>
    </Dialog>
  );
};
