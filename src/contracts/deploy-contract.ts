import Web3 from 'web3/lib/types';
import { Contract } from 'web3-eth-contract';
import { resolveAsStatusMessage } from '../utils/status-message-utils';
import {errorMessage, StatusMessage} from "../utils/status-message";

export async function deployContract({
  web3,
  contractABI,
  contractBytecode,
  from,
  constructorArgs
}: {
  web3: Web3;
  contractABI: string;
  contractBytecode: string;
  from: string;
  constructorArgs?: any;
}): Promise<StatusMessage | string> {
  try {
    const contract = new Contract(JSON.parse(contractABI), web3);

    // const gasPrice = await contract.getGasPrice();
    // Deploy the contract

    const estimatedGas = await contract
      .deploy({
        data: contractBytecode,
        arguments: constructorArgs
      })
      .estimateGas();

    console.log('estimated gas', estimatedGas);
    const deployedContract = await contract
      .deploy({
        data: contractBytecode,
        arguments: constructorArgs
      })
      .send({
        from
      });

    // Get the contract address
    const contractAddress = deployedContract.options.address;

    console.log('Contract address:', contractAddress);

    if (contractAddress) {
      return contractAddress.toLowerCase();
    } else {
      return errorMessage('No Contract Address');
    }
  } catch (e) {
    return resolveAsStatusMessage('Deployment of contract failed!', e);
  }
}
