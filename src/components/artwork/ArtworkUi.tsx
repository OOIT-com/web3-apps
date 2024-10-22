import * as React from 'react';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { infoMessage, isStatusMessage, StatusMessage } from '../../types';
import { Box, Paper } from '@mui/material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { IrysManageUi } from '../irys-components/IrysManageUi';
import { IrysFileUpload } from './IrysFileUpload';
import { IrysAccess } from '../../utils/IrysAccess';
import { CreateArtworkUi } from './CreateArtworkUi';
import { DecryptFileUi } from './DecryptFileUi';
import { getArtworkTimeProof } from '../../contracts/artwork-time-proof/ArtworkTimeProof-support';
import { ArtworkListUi } from './ArtworkListUi';
import { useAppContext } from '../AppContextProvider';
import { CollapsiblePanel } from '../common/CollapsiblePanel';
import { Web3NotInitialized } from '../common/Web3NotInitialized';
import { AppTopTitle } from '../common/AppTopTitle';
import artworkPng from '../images/artwork.png';
import { NoContractFound } from '../common/NoContractFound';
import { ContractName } from '../../contracts/contract-utils';

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
    const init = async () =>
      wrap('Initializing Irys Access...', async () => {
        setStatusMessage(infoMessage('Initializing Irys Access...'));
        if (web3Session) {
          const _irysAccess = new IrysAccess(web3Session);
          const res = await _irysAccess.init();
          if (isStatusMessage(res)) {
            setStatusMessage(res);
          } else {
            setStatusMessage(undefined);
            setIrysAccess(_irysAccess);
          }
        }
      });

    init().catch(console.error);
  }, [wrap, web3Session]);

  if (!publicAddress || !web3) {
    return <Web3NotInitialized />;
  }

  const content: ReactNode[] = [<StatusMessageElement key={'statusMessage'} statusMessage={statusMessage} />];

  const artworkTimeProof = getArtworkTimeProof();
  if (!artworkTimeProof) {
    return <NoContractFound name={ContractName.ARTWORK_TIME_PROOF} />;
  }

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
          {value === 0 && <ArtworkListUi artworkTimeProof={artworkTimeProof} />}
          {value === 1 && <CreateArtworkUi irysAccess={irysAccess} artworkTimeProof={artworkTimeProof} />}
          {value === 2 && <IrysManageUi irysAccess={irysAccess} />}
          {value === 3 && <IrysFileUpload irysAccess={irysAccess} />}
          {value === 4 && <DecryptFileUi />}
        </Paper>
      </Box>
    );
  }

  return (
    <CollapsiblePanel
      help={help}
      level={'top'}
      title={<AppTopTitle title={'Artwork'} avatar={artworkPng} />}
      content={content}
      collapsible={false}
    />
  );
}
