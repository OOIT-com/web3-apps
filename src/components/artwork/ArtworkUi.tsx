import * as React from 'react';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { isStatusMessage, StatusMessage } from '../../types';
import { Box, Paper } from '@mui/material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { IrysFundingUi } from '../irys-components/IrysFundingUi';
import { IrysFileUpload } from './IrysFileUpload';
import { IrysAccess, newIrysAccess } from '../../utils/IrysAccess';
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
import help from './ArtworkHelp.md';

export function ArtworkUi() {
  const { wrap, web3Session } = useAppContext();
  const { web3, publicAddress } = web3Session || {};

  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [irysAccess, setIrysAccess] = useState<IrysAccess>();

  const [value, setValue] = React.useState(0);
  const handleChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  }, []);

  const initIrys = useCallback(async () => {
    setStatusMessage(undefined);
    const r = await wrap('Initializing Irys Access...', async () => {
      if (web3Session) {
        const irysAccess = await newIrysAccess(web3Session);
        if (isStatusMessage(irysAccess)) {
          setStatusMessage(irysAccess);
        } else {
          setIrysAccess(irysAccess);
        }
      }
    });
    if (isStatusMessage(r)) {
      setStatusMessage(r);
    }
  }, [web3Session, wrap]);

  useEffect(() => {
    initIrys().catch(console.error);
  }, [initIrys]);

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
            <Tab label="Irys File Upload" />
            <Tab label="Irys Funding" />
            <Tab label="Decryption" />
          </Tabs>
        </Box>
        <Paper sx={{ margin: '1em 0 1em 0' }}>
          {value === 0 && <ArtworkListUi artworkTimeProof={artworkTimeProof} />}
          {value === 1 && <CreateArtworkUi irysAccess={irysAccess} artworkTimeProof={artworkTimeProof} />}
          {value === 2 && <IrysFileUpload irysAccess={irysAccess} />}
          {value === 3 && <IrysFundingUi irysAccess={irysAccess} />}
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
