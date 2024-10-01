import { errorMessage, infoMessage, Web3Session } from '../types';
import { getNetworkInfo } from '../network-info';
import { HDNodeWallet, Mnemonic } from 'ethers';
import Web3 from 'web3';
import { mmPublicEncryptionKey } from '../utils/nacl-util';
import { Buffer } from 'buffer';
import { decryptStandalone } from '../utils/metamask-util';
import { AppContextData } from './AppContextProvider';

export type DecryptFun = (msg: Uint8Array) => Promise<Uint8Array | null>;

export async function connectWithLocalstore(
  app: AppContextData,
  networkId: number,
  secret: string
): Promise<Web3Session | undefined> {
  const { dispatchSnackbarMessage } = app;
  const network = getNetworkInfo(+networkId);
  if (!network) {
    dispatchSnackbarMessage(errorMessage('Unknown Network!'));
    return;
  }
  let privateKey = secret;
  if (secret.trim().toLowerCase().startsWith('0x')) {
    dispatchSnackbarMessage(infoMessage('Secret is a Private Key!'));
  } else {
    dispatchSnackbarMessage(infoMessage('Secret is a Mnemonic!'));
    const mn: Mnemonic = Mnemonic.fromPhrase(secret);
    privateKey = HDNodeWallet.fromMnemonic(mn).privateKey;
  }
  const web3 = new Web3(network.rpcUrl);
  web3.eth.accounts.wallet.add(privateKey);
  const publicAddress = web3.eth.accounts.wallet[0].address.toLowerCase();
  const publicKey = mmPublicEncryptionKey(privateKey);
  const privateKeyUint8Array = new Uint8Array(Buffer.from(privateKey.substring(2), 'hex'));
  const decryptFun: DecryptFun = async (message: Uint8Array) => {
    const arr: Uint8Array | null = decryptStandalone(privateKeyUint8Array, message);
    if (arr) {
      Buffer.from(arr);
      const decMessageUtf8 = Buffer.from(arr).toString('utf-8');
      const decMessageBuff = Buffer.from(decMessageUtf8, 'base64');
      return new Uint8Array(decMessageBuff);
    }
    return null;
  };

  return {
    mode: 'localstore',
    networkId,
    web3,
    publicAddress,
    publicKeyHolder: {
      publicKey,
      origin: 'wallet'
    },
    decryptFun,
    secret: privateKey
  };
}
