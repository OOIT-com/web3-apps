import Web3 from 'web3';
import { BigNumber } from '@ethersproject/bignumber';
import { ethers } from 'ethersv5';

export async function getCurrentAddress(web3: Web3) {
  const coinbase = await web3.eth.getCoinbase();
  let addr = coinbase;
  if (Array.isArray(coinbase)) {
    addr = coinbase[0];
  }
  if (!addr) {
    return;
  }
  return addr.toLowerCase();
}

export async function getCurrentNetworkId(web3: Web3): Promise<number> {
  return +((await web3.eth.net.getId()) || '-1').toString();
}

export const toEth = (weiBn: BigNumber) => weiBn.div(BigNumber.from(10).pow(18));

export const ethNumberToWei = (n: string | number): BigNumber => ethers.utils.parseEther(n.toString());

export const weiToEther = (weiValue: BigNumber | string) => ethers.utils.formatEther(weiValue.toString());
export const isAddress = (address: string) => ethers.utils.isAddress(address);

export const getContractBalance = async (web3: Web3, contractAddress: string) => {
  try {
    const balanceWei = await web3.eth.getBalance(contractAddress);
    const balanceEther = web3.utils.fromWei(balanceWei, 'ether');
    return balanceEther;
  } catch (error) {
    console.error('Error fetching contract balance:', error);
    throw error; // Or handle the error appropriately
  }
};
