import * as React from 'react';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { isStatusMessage, StatusMessage, warningMessage } from '../../types';
import { Box, Paper } from '@mui/material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { IrysManageUi } from '../irys-components/IrysManageUi';
import { IrysFileUpload } from './IrysFileUpload';
import { IrysAccess } from '../../utils/IrysAccess';
import { CreateArtworkTimeProofUi } from './CreateArtworkTimeProofUi';
import { DecryptFileUi } from './DecryptFileUi';
import { getArtworkTimeProof } from '../../contracts/artwork-time-proof/ArtworkTimeProof-support';
import { MyArtworkProofs } from './MyArtworkProofs';
import { useAppContext } from '../AppContextProvider';
import { CollapsiblePanel } from '../common/CollapsiblePanel';

const help = `

Here you can encrypt, create a SHA 256 hash, decrypt and create a artwork proof.

You can:

- *Encrypt*: Provide a file, encrypt it and download it including the metadata with secret key and hash.
- *Decrpyt* : Decrypt the file.
- *Create Artwork Time Proof*: create a secure time entry on the the blockchain.
- *List all your Artwork Time Proof*: List all Artwork Time Proofs entries created. 

All processing is done locally on your browser memory *no data* is stored or uploaded to any site or kept in a local storage! 
There is a file size limit due to the browser (On Chrome: currently c.a. 50 MB).

    
`;

export function ArtworkUi() {
  const { wrap, web3Session } = useAppContext();
  const { web3, publicAddress } = web3Session || {};

  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [irysAccess, setIrysAccess] = useState<IrysAccess>();

  const [value, setValue] = React.useState(0);
  const handleChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  }, []);

  useEffect(() => {
    const init = async () => {
      if (web3Session) {
        const res = await wrap('Initializing Irys Access...', async () => {
          const irys0 = new IrysAccess(web3Session);
          const res = await irys0.init();
          if (isStatusMessage(res)) {
            return res;
          }
          setIrysAccess(irys0);
        });
        if (isStatusMessage(res)) {
          setStatusMessage(res);
        }
      }
    };
    init().catch(console.error);
  }, [wrap, web3Session]);

  if (!publicAddress || !web3) {
    return <StatusMessageElement statusMessage={warningMessage('Web3 is not initialized!')} />;
  }

  const content: ReactNode[] = [<StatusMessageElement key={'statusMessage'} statusMessage={statusMessage} />];

  if (irysAccess) {
    content.push(
      <Box key={'irys-content'} sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="My Artwork Proofs" />
            <Tab label="Create Artwork TP" />
            <Tab label="Irys Funding" />
            <Tab label="Irys File Upload" />
            <Tab label="Decryption" />
          </Tabs>
        </Box>
        <Paper sx={{ margin: '1em 0 1em 0' }}>
          {value === 0 && <MyArtworkProofs artworkTimeProof={getArtworkTimeProof()} />}
          {value === 1 && <CreateArtworkTimeProofUi irysAccess={irysAccess} artworkTimeProof={getArtworkTimeProof()} />}
          {value === 2 && <IrysManageUi irysAccess={irysAccess} />}
          {value === 3 && <IrysFileUpload irysAccess={irysAccess} />}
          {value === 4 && <DecryptFileUi />}
        </Paper>
      </Box>
    );
  }

  return <CollapsiblePanel help={help} level={'top'} title={'Artwork'} content={content} collapsible={false} />;
}
