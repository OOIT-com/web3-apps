import { infoMessage, StatusMessage } from '../../types';
import Web3 from 'web3';
import { ownableWithBackupAbi } from './OwnableWithBackup-abi';
import { resolveAsStatusMessage } from '../../utils/status-message-utils';
import { Contract } from 'web3-eth-contract'; // type OwnableWithBackupContractType = typeof registerAbi;

type OwnableWithBackupAbiType = typeof ownableWithBackupAbi;
type OwnableWithBackupContractType = Contract<OwnableWithBackupAbiType>;

export function getOwnableWithBackup(web3: Web3, contractAddress: string): OwnableWithBackup {
  const contract = new web3.eth.Contract(
    ownableWithBackupAbi,
    contractAddress
    //, web3
  );
  return new OwnableWithBackup(contract);
}

export function getOwner(web3: Web3, contractAddress: string) {
  const owb = getOwnableWithBackup(web3, contractAddress);
  return owb.owner();
}

export class OwnableWithBackup {
  private readonly contract: OwnableWithBackupContractType;

  constructor(contract: OwnableWithBackupContractType) {
    this.contract = contract;
  }

  public getContract = (): OwnableWithBackupContractType => this.contract;

  public async owner(): Promise<string | StatusMessage> {
    try {
      return (await this.contract.methods.owner().call()).toString().toLowerCase();
    } catch (e) {
      console.error(e);
      return resolveAsStatusMessage('Calling owner failed', e);
    }
  }

  public async maxMaxNumberOfBackupOwners(): Promise<number> {
    try {
      const r = await this.contract.methods.maxMaxNumberOfBackupOwners().call();
      return +r.toString();
    } catch (e) {
      console.error(e);
      throw new Error('maxMaxNumberOfBackupOwners failed');
    }
  }

  public async minNumberOfVotes(): Promise<number | StatusMessage> {
    try {
      const r = await this.contract.methods.minNumberOfVotes().call();
      return +r.toString();
    } catch (e) {
      return resolveAsStatusMessage('minNumberOfVotes', e);
    }
  }

  public async getBackupOwnerCount(): Promise<number | StatusMessage> {
    try {
      const r = await this.contract.methods.getBackupOwnerCount().call();
      return +r.toString();
    } catch (e) {
      return resolveAsStatusMessage('backUpOwnerLength', e);
    }
  }

  public async getBackupOwner(index: number): Promise<string | StatusMessage> {
    const tag = '<Get Backup Owner>';
    try {
      const r = await this.contract.methods.backupOwnerAddressList(index).call();
      return r.toString().toLowerCase();
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async addBackupOwner(newBackupOwner: string, from: string): Promise<StatusMessage> {
    const tag = '<Add Backup Owner>';
    try {
      await this.contract.methods.addBackupOwner(newBackupOwner).call({
        from
      });
      const { transactionHash } = await this.contract.methods.addBackupOwner(newBackupOwner).send({
        from
      });
      return infoMessage(`Transaction receipt of ${tag} : ${transactionHash}`);
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async removeBackupOwner(backupOwner: string, from: string): Promise<StatusMessage> {
    const tag = '<Remove Backup Owner>';
    try {
      await this.contract.methods.removeBackupOwner(backupOwner).call({
        from
      });
      const { transactionHash } = await this.contract.methods.removeBackupOwner(backupOwner).send({
        from
      });
      return infoMessage(`Transaction receipt of ${tag} : ${transactionHash}`);
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async voteForNewOwner(newOwner: string, from: string): Promise<StatusMessage> {
    const tag = '<Vote for New Owner>';
    try {
      await this.contract.methods.voteForNewOwner(newOwner).call({
        from
      });
      const { transactionHash } = await this.contract.methods.voteForNewOwner(newOwner).send({
        from
      });
      return infoMessage(`Transaction receipt of ${tag} : ${transactionHash}`);
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }

  public async activateOwnership(from: string): Promise<StatusMessage> {
    const tag = '<Activate New Owner>';
    try {
      await this.contract.methods.activateOwnership().call({
        from
      });
      const { transactionHash } = await this.contract.methods.activateOwnership().send({
        from
      });
      return infoMessage(`Transaction receipt of ${tag} : ${transactionHash}`);
    } catch (e) {
      return resolveAsStatusMessage(`${tag}`, e);
    }
  }
}
