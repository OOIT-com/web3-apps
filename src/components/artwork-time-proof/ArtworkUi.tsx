import * as React from 'react';
import { ReactNode, useCallback, useEffect, useState } from 'react';
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
import { web3NotInitialized, Web3NotInitialized } from '../common/Web3NotInitialized';
import { AppTopTitle } from '../common/AppTopTitle';
import artworkPng from '../images/artwork.png';
import { NoContractFound } from '../common/NoContractFound';
import { ContractName } from '../../contracts/contract-utils';
import help from './ArtworkHelp.md';
import { isStatusMessage, StatusMessage } from '../../utils/status-message';

export function ArtworkUi() {
  const { wrap, web3Session } = useAppContext();
  const { web3, publicAddress } = web3Session || {};

  const [statusMessage, setStatusMessage] = useState<StatusMessage>();
  const [irysAccess, setIrysAccess] = useState<IrysAccess>();

  const [tabIndex, setTabIndex] = React.useState(0);
  const handleChange = useCallback((_event: React.SyntheticEvent, newTabIndex: number) => {
    setTabIndex(newTabIndex);
  }, []);

  const initIrys = useCallback(async () => {
    setStatusMessage(undefined);
    const irysAccess = await wrap('Initializing Irys Access...', async () => {
      if (web3Session) {
        return await newIrysAccess(web3Session);
      }
      return web3NotInitialized;
    });
    if (isStatusMessage(irysAccess)) {
      setStatusMessage(irysAccess);
    } else {
      setIrysAccess(irysAccess);
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
          <Tabs value={tabIndex} onChange={handleChange}>
            <Tab label="My Artwork Proofs" />
            <Tab label="Create Artwork" />
            <Tab label="Irys File Upload" />
            <Tab label="Irys Funding" />
            <Tab label="Decryption" />
          </Tabs>
        </Box>
        <Paper sx={{ margin: '1em 0 1em 0' }}>
          {tabIndex === 0 && <ArtworkListUi artworkTimeProof={artworkTimeProof} />}
          {tabIndex === 1 && <CreateArtworkUi irysAccess={irysAccess} artworkTimeProof={artworkTimeProof} />}
          {tabIndex === 2 && <IrysFileUpload irysAccess={irysAccess} />}
          {tabIndex === 3 && <IrysFundingUi irysAccess={irysAccess} />}
          {tabIndex === 4 && <DecryptFileUi />}
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
