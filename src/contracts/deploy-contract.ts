import Web3 from 'web3/lib/types';
import { Contract } from 'web3-eth-contract';
import { errorMessage } from '../types';
import { resolveAsStatusMessage } from '../utils/status-message-utils';

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
}) {
  try {
    const contract = new Contract(JSON.parse(contractABI), web3);

    // Deploy the contract
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
    return resolveAsStatusMessage('Deploy contract failed!', e);
  }
}
