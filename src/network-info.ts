import { NetworkInfo } from './types';
export const networks: NetworkInfo[] = [
  {
    name: 'n/a',
    chainId: 0,
    currencySymbol: 'n/a',
    blockExplorerUrl: 'n/a',
    rpcUrl: '',
    PostFix: '',
    isMainnet: false
  },
  {
    name: 'Ethereum Mainnet',
    chainId: 1,
    currencySymbol: 'ETH',
    blockExplorerUrl: 'https://etherscan.io',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID',
    PostFix: 'ETHEREUM_MAINNET',
    isMainnet: true,
    isEVM: true
  },
  {
    name: 'Rinkeby Testnet',
    chainId: 4,
    currencySymbol: 'ETH',
    blockExplorerUrl: 'https://rinkeby.etherscan.io',
    rpcUrl: 'https://rinkeby.infura.io/v3/YOUR-PROJECT-ID',
    PostFix: 'ETHEREUM_RINKEBY',
    isMainnet: false,
    isEVM: true
  },
  {
    name: 'Goerli Testnet',
    chainId: 5,
    currencySymbol: 'ETH',
    blockExplorerUrl: '',
    rpcUrl: '',
    PostFix: 'ETHEREUM_GOERLI',
    isMainnet: false,
    isEVM: true
  },
  {
    name: 'Binance Smart Chain Mainnet',
    chainId: 56,
    currencySymbol: 'BNB',
    blockExplorerUrl: 'https://bscscan.com',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    PostFix: '',
    isMainnet: true,
    isEVM: true
  },
  {
    name: 'Binance Smart Chain Testnet',
    chainId: 97,
    currencySymbol: 'BNB',
    blockExplorerUrl: 'https://testnet.bscscan.com',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    PostFix: '',
    isMainnet: false,
    isEVM: true
  },
  {
    name: 'Polygon (Matic) Mainnet',
    chainId: 137,
    currencySymbol: 'MATIC',
    blockExplorerUrl: 'https://polygonscan.com',
    rpcUrl: 'https://rpc-mainnet.maticvigil.com',
    PostFix: 'POLYGON_MAINNET',
    irysTokenname: 'matic',
    isMainnet: true,
    isEVM: true
  },
  {
    name: 'Polygon Amoy Testnet',
    chainId: 80002,
    currencySymbol: 'MATIC',
    blockExplorerUrl: 'https://www.oklink.com/amoy',
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    PostFix: 'POLYGON_AMOY',
    irysTokenname: 'matic',
    isMainnet: false,
    faucetUrls: ['https://getblock.io/faucet/matic-amoy/'],
    isEVM: true
  },
  {
    name: 'Fantom Opera Mainnet',
    chainId: 250,
    currencySymbol: 'FTM',
    blockExplorerUrl: 'https://ftmscan.com',
    rpcUrl: 'https://rpcapi.fantom.network',
    PostFix: 'FANTOM_MAINNET',
    homePage: 'https://fantom.foundation',
    irysTokenname: 'fantom',
    isMainnet: true,
    isEVM: true
  },
  {
    name: 'Fantom Testnet',
    chainId: 4002,
    currencySymbol: 'FTM',
    blockExplorerUrl: 'https://explorer.testnet.fantom.network',
    rpcUrl: 'https://rpc.testnet.fantom.network',
    PostFix: 'FANTOM_TESTNET',
    irysTokenname: 'fantom',
    isMainnet: false,
    isEVM: true
  },
  {
    name: 'Sonic Testnet',
    chainId: 64165,
    currencySymbol: 'S',
    blockExplorerUrl: 'https://testnet.soniclabs.com/',
    rpcUrl: 'https://rpc.testnet.soniclabs.com/',
    PostFix: 'SONIC_TESTNET',
    homePage: 'https://sonicscan.io',
    isMainnet: false,
    isEVM: true,
    faucetUrls: ['https://testnet.soniclabs.com/account']
  },
  {
    name: 'Moonriver Mainnet',
    chainId: 1285,
    currencySymbol: 'MOVR',
    blockExplorerUrl: 'https://blockscout.moonbeam.network/moonriver',
    rpcUrl: 'https://rpc.moonriver.moonbeam.network',
    PostFix: '',
    isMainnet: true,
    isEVM: true
  },
  {
    name: 'Optimism Mainnet',
    chainId: 10,
    currencySymbol: 'ETH',
    blockExplorerUrl: 'https://optimistic.etherscan.io',
    rpcUrl: 'https://mainnet.optimism.io',
    PostFix: 'OPTIMISM_MAINNET',
    isMainnet: true,
    isEVM: true
  },
  {
    name: 'Filecoin - Calibration Testnet',
    chainId: 314159,
    currencySymbol: 'tFIL',
    blockExplorerUrl: 'https://calibration.filscan.io',
    rpcUrl: '',
    PostFix: '',
    isMainnet: true
  },
  {
    name: 'Filecoin - Mainnet',
    chainId: 314,
    currencySymbol: 'FIL',
    blockExplorerUrl: 'https://filfox.info/en',
    rpcUrl: '',
    PostFix: '',
    isMainnet: true
  },
  {
    name: 'Avalanche Fuji Testnet',
    chainId: 43113,
    currencySymbol: 'AVAX',
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    blockExplorerUrl: 'https://subnets-test.avax.network/c-chain',
    PostFix: 'AVAX_FUJI_TESTNET',
    irysTokenname: 'avalanche',
    isMainnet: false,
    isEVM: true
  },
  {
    name: 'Avalanche C-Chain',
    chainId: 43114,
    currencySymbol: 'AVAX',
    blockExplorerUrl: 'https://cchain.explorer.avax.network',
    rpcUrl: 'https//api.avax.network/ext/bc/C/rpc',
    PostFix: 'AVAX_MAINNET',
    isMainnet: true,
    irysTokenname: 'avalanche',
    isEVM: true
  },
  {
    name: 'Harmony Testnet Shard 0',
    chainId: 1666700000,
    PostFix: 'HARMONY_TESTNET',
    currencySymbol: 'ONE',
    rpcUrl: 'https://api.s0.b.hmny.io',
    blockExplorerUrl: 'https://explorer.testnet.harmony.one/',
    isMainnet: false,
    isEVM: true
  },
  {
    name: 'Harmony Mainnet',
    PostFix: 'HARMONY',
    chainId: 1666600000,
    currencySymbol: 'ONE',
    rpcUrl: 'https://api.harmony.one',
    blockExplorerUrl: 'https://explorer.harmony.one/',
    isMainnet: true,
    isEVM: true
  }
];

export const getNetworkInfo = (chainId = 0): NetworkInfo => networks.find((n) => n.chainId === chainId) ?? networks[0];
