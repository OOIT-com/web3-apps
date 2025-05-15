import Web3 from 'web3';
import { BigNumber } from '@ethersproject/bignumber';
import { ethers } from 'ethersv5';
import { Web3Session } from '../types';
import { displayAddress } from './misc-util';
import { resolveAsStatusMessage } from './status-message-utils';
import {errorMessage, StatusMessage, successMessage} from "./status-message";

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

export const getContractBalance = async (web3: Web3, contractAddress: string): Promise<string | StatusMessage> => {
  try {
    const balanceWei = await web3.eth.getBalance(contractAddress);
    return web3.utils.fromWei(balanceWei, 'ether');
  } catch (error) {
    return resolveAsStatusMessage('Error fetching balance', error);
  }
};

export const sendAmount = async (
  { publicAddress, web3 }: Web3Session,
  toAddress: string,
  amountToSendEth: string
): Promise<StatusMessage> => {
  try {
    if (!isAddress(toAddress)) {
      return errorMessage(`Address ${toAddress} is not a valid address!`);
    }
    if (+amountToSendEth <= 0) {
      return errorMessage(`Can not send ${amountToSendEth}!`);
    }
    const balanceWei = await web3.eth.getBalance(publicAddress);
    const balanceEth = +web3.utils.fromWei(balanceWei, 'ether');

    if (balanceEth < +amountToSendEth) {
      return errorMessage(`Not enough balance on your account ${displayAddress(publicAddress)}!`);
    }

    const fromAddress = publicAddress; // Sender's address
    const amountToSend = web3.utils.toWei(amountToSendEth, 'ether'); // Amount in Wei

    const transactionObject = {
      from: fromAddress,
      to: toAddress,
      value: amountToSend
      // You might need to add gasPrice or maxFeePerGas
      // depending on your provider and network conditions
    };
    // const p = new Promise<StatusMessage>((resolve) => {
    //   try {
    //     web3.eth
    //       .sendTransaction(transactionObject)
    //       .on('transactionHash', (hash) => {
    //         console.log('Transaction Hash:', hash);
    //       })
    //       .on('confirmation', () => {
    //         resolve(successMessage(`Amount ${amountToSendEth} sent to ${displayAddress(toAddress)}!`));
    //       })
    //       .on('error', (error) => {
    //         resolve(resolveAsStatusMessage(`Could not send value ${amountToSendEth}!`, error));
    //       })
    //       .catch((e) => resolve(resolveAsStatusMessage('Payment failed', e)));
    //   } catch (e) {
    //     resolveAsStatusMessage('Payment failed', e);
    //   }
    // });
    //
    const p = web3.eth.sendTransaction(transactionObject).catch((error) => {
      // Handle the error here
      console.error('Error in sendTransaction:', error);
      // Optionally re-throw to be caught by the outer try-catch
      throw error;
    });

    const tx = await p;
    return successMessage(`Payment successful. Blockhash: ${tx.blockHash}`);
  } catch (error) {
    return resolveAsStatusMessage('Payment failed', error);
  }
};
