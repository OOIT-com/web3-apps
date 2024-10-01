import { Numbers } from 'web3';
import { formatUnits } from 'ethers';
import { Box } from '@mui/material';

export function Wei({ wei, display = 'wei' }: { wei?: Numbers; display?: 'wei' | 'gwei' | 'ether' }) {
    return (
        <Box onClick={() => {}} sx={{ padding: '0.2em', margin: '0.2em', border: 'gray dashed 1px' }}>
            {wei ? `${formatUnits(wei, display)} ${display}` : `- ${display}`}
        </Box>
    );
}
