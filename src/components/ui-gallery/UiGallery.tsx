import { CollapsiblePanel } from '../common/CollapsiblePanel';
import { Stack } from '@mui/material';
import Button from '@mui/material/Button';

const DairyOnBlockchainUi = () => {
  return (
    <CollapsiblePanel
      level={'second'}
      title={'My Blockchain Dairy'}
      content={[<Stack key={'first-entry'}>My first entry</Stack>]}
    />
  );
};

export const Secondary01 = () => {
  return (
    <CollapsiblePanel
      collapsed={true}
      title={'My Crypto Ui'}
      level={'second'}
      content={[<DairyOnBlockchainUi key={'create-a-daily-node'} />]}
      toolbar={[
        <Button key={'1'} onClick={() => alert('refresh')}>
          Refresh
        </Button>
      ]}
    />
  );
};

export const UiGallery = () => {
  return (
    <CollapsiblePanel
      collapsed={true}
      title={<div>Top Border Panel</div>}
      level={'top'}
      content={[<DairyOnBlockchainUi key={'1'} />, <Secondary01 key={'2'} />]}
    />
  );
};
