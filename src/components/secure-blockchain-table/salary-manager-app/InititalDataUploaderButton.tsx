import { StatusMessage } from '../../../types';
import { InitialData } from './types';
import { FileUploader } from 'react-drag-drop-files';
import { loadWorkBook } from './sm-app-utils';
import { workbookToInitialData } from './sm-table/workbook-utils';
import Button from '@mui/material/Button';

export function InititalDataUploaderButton({
  setUploadResult
}: Readonly<{
  setUploadResult: (res: StatusMessage | InitialData) => void;
}>) {
  return (
    <FileUploader
      key={'uploader'}
      handleChange={async (file: File) => {
        if (file) {
          const wb = await loadWorkBook(file);
          if (wb) {
            const res = workbookToInitialData(wb);
            setUploadResult(res);
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
