import { BoxKeyPair } from 'tweetnacl';
import { Box, Stack } from '@mui/material';
import { displayKey, uint8Array2Hex } from '../../utils/enc-dec-utils';

const SX = { fontFamily: 'Courier' };

export function KeyPairDisplay({ keyPair }: { keyPair: BoxKeyPair }) {
  return (
    <Stack sx={SX} direction="row" justifyContent="flex-start" alignItems="flex-start" spacing={4}>
      <Box>Public: {displayKey(uint8Array2Hex(keyPair.publicKey))}</Box>
      <Box>Secret: {displayKey(uint8Array2Hex(keyPair.secretKey))}</Box>
      {/*<Button*/}
      {/*  size={'small'}*/}
      {/*  fullWidth={false}*/}
      {/*  onClick={() => {*/}
      {/*    const text = JSON.stringify({*/}
      {/*      publicKey: u8ToHex(keyPair.publicKey),*/}
      {/*      secretKey: u8ToHex(keyPair.secretKey)*/}
      {/*    });*/}
      {/*    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });*/}
      {/*    FileSaver.saveAs(blob, 'key-pair.json');*/}
      {/*  }}*/}
      {/*>*/}
      {/*  Download Key Pair*/}
      {/*</Button>*/}
    </Stack>
  );
}
