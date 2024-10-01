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
  }
];

export const getNetworkInfo = (chainId: number): NetworkInfo =>
  networks.find((n) => n.chainId === chainId) ?? networks[0];
