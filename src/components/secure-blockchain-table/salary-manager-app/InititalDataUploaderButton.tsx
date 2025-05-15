import { FileUploader } from 'react-drag-drop-files';
import { loadWorkBook } from './sm-app-utils';
import { workbookToInitialData } from './sm-table/workbook-utils';
import Button from '@mui/material/Button';
import {isStatusMessage, StatusMessage} from "../../../utils/status-message";

export function InititalDataUploaderButton({
  setUploadResult
}: Readonly<{
  setUploadResult: (res: StatusMessage | string) => void;
}>) {
  return (
    <FileUploader
      key={'uploader'}
      handleChange={async (file: File) => {
        if (file) {
          const wb = await loadWorkBook(file);
          if (wb) {
            const res = workbookToInitialData(wb);
            if (isStatusMessage(res)) {
              setUploadResult(res);
            } else {
              setUploadResult(JSON.stringify(res));
            }
          }
        }
      }}
      name="file"
      types={['xlsx']}
    >
      <Button>Upload Excel</Button>
    </FileUploader>
  );
}
