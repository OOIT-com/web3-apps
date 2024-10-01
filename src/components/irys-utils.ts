import Irys, { WebIrys } from '@irys/sdk';
import Web3 from 'web3';
import { Wallet } from 'ethers';

const token = 'matic';
export const getIrys = async (web3: Web3, key: string, isMainnet: boolean) => {
  let url = '';
  let providerUrl = '';
  if (isMainnet) {
    url = 'https://node1.irys.xyz';
  } else {
    url = 'https://devnet.irys.xyz';
    providerUrl = 'https://rpc-mumbai.maticvigil.com';
  }

  // Devnet RPC URLs change often, use a recent one from https://chainlist.org/chain/80001
  const irys = new WebIrys({
    url, // URL of the node you want to connect to
    token, // Token used for payment
    wallet: {
      rpcUrl: providerUrl,
      name: 'ethersv5',
      // Provider: web3.eth.accounts.privateKeyToAccount(key) }
      provider: getWallet(key, web3.provider)
    }
  });
  console.log(`irys address = ${irys.address}`);
  irys.ready();
  return irys;
};

export const getIrys22 = async (key: string, isMainnet: boolean) => {
  let url = '';
  let providerUrl = '';
  if (isMainnet) {
    url = 'https://node1.irys.xyz';
  } else {
    url = 'https://devnet.irys.xyz';
    providerUrl = 'https://rpc-mumbai.maticvigil.com';
  }

  // Devnet RPC URLs change often, use a recent one from https://chainlist.org/chain/80001
  const irys: Irys = new Irys({
    url, // URL of the node you want to connect to
    token, // Token used for payment
    key, // Private key
    config: providerUrl ? { providerUrl } : {} // Optional provider URL, only required when using Devnet
  });
  return irys;
};

export function getWallet(key: string, provider: any) {
  return new Wallet(key, provider);
}

export async function testIrys22(web3: Web3, key: string, isMainnet: boolean) {
  const irys = await getIrys(web3, key, isMainnet);
  const irys2 = await getIrys22(key, isMainnet);
  await irys2.ready();
  console.debug('irys address: ', irys.address);
}
