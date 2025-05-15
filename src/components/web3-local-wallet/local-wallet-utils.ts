import { HDNodeWallet, Wallet } from 'ethers';
import { isMnemonic, isPrivateKey } from '../../utils/ethers-utils';
import {errorMessage, StatusMessage} from "../../utils/status-message";

export type LocalWalletData = { name: string; address: string; encWalletJson: string };
export const local_wallet_list_name = '__LOCAL_WALLET_LIST_OOIT__';

export const addLocalWalletToLocalStorage = (accountEntry: LocalWalletData): void => {
  const updatedStorage = getLocalWalletList();
  updatedStorage.push(accountEntry);
  localStorage.setItem(local_wallet_list_name, JSON.stringify(updatedStorage));
};

export const removeLocalWalletFromLocalStorage = (index: number): void => {
  const updatedStorage = getLocalWalletList().filter((_, i) => i !== index);
  localStorage.setItem(local_wallet_list_name, JSON.stringify(updatedStorage));
};

export const removeAllLocalWalletFromLocalStorage = (): void => {
  localStorage.removeItem(local_wallet_list_name);
};

export const getLocalWalletFromLocalStorage = (index: number): LocalWalletData => {
  return getLocalWalletList()[index];
};

export const extractPrivateKey = (ae: LocalWalletData, walletPassword: string): string | undefined => {
  try {
    const w = Wallet.fromEncryptedJsonSync(ae.encWalletJson, walletPassword);
    return w.privateKey;
  } catch (e) {
    return;
  }
};

export const getLocalWalletList = (): LocalWalletData[] => {
  const s = localStorage.getItem(local_wallet_list_name);
  let list: LocalWalletData[] = [];
  if (s) {
    list = JSON.parse(s) as LocalWalletData[];
  }
  return list;
};
export const createAccountEntry = async ({
  name,
  secret,
  walletPassword
}: {
  name: string;
  secret: string;
  walletPassword: string;
}): Promise<LocalWalletData | StatusMessage> => {
  let wallet: Wallet | HDNodeWallet | undefined = undefined;
  if (isPrivateKey(secret)) {
    wallet = new Wallet(secret);
  }
  if (isMnemonic(secret)) {
    wallet = Wallet.fromPhrase(secret);
  }
  if (!wallet) {
    return errorMessage(`Could not create an account with ${secret}`);
  }
  return {
    name,
    address: wallet.address,
    encWalletJson: await wallet.encrypt(walletPassword)
  };
};
