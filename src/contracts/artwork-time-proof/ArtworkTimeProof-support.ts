import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { errorMessage, isStatusMessage, StatusMessage, successMessage } from '../../types';

import { resolveAsStatusMessage } from '../../utils/status-message-utils';
import { artworkTimeProofAbi } from './ArtworkTimeProof';
import { ContractRegistry } from '../contract-registry/ContractRegistry-support';
import { ContractName } from '../contract-utils';

type ArtworkTimeProofType = typeof artworkTimeProofAbi;
export type ArtworkEntry = {
  name: string;
  description: string;
  author: string;
  hash: string;
  locationUri?: string;
  timestamp?: number;
};

let instance: ArtworkTimeProof | undefined;
export const getArtworkTimeProof = () => instance;

type ArtworkTimeProofAbiType = typeof artworkTimeProofAbi;
type ArtworkTimeProofContractType = Contract<ArtworkTimeProofAbiType>;

export async function initArtworkTimeProof(
  contractRegistry: ContractRegistry,
  web3: Web3,
  from: string
): Promise<StatusMessage> {
  const res = await contractRegistry.getByName(ContractName.ARTWORK_TIME_PROOF);
  if (isStatusMessage(res)) {
    return res;
  }
  const contractAddress = res.contractAddress.toLowerCase();

  if (!contractAddress) {
    return errorMessage(`Contract address for ${ContractName.ARTWORK_TIME_PROOF} missing!`);
  }
  const contract: ArtworkTimeProofContractType = new web3.eth.Contract(artworkTimeProofAbi, contractAddress, web3);
  instance = new ArtworkTimeProof(contract, from);
  return successMessage(`Contract ${ContractName.ARTWORK_TIME_PROOF} successfully initialized!`);
}

export class ArtworkTimeProof {
  private readonly from: string;
  private readonly contract: Contract<ArtworkTimeProofType>;

  constructor(contract: ArtworkTimeProofContractType, from: string) {
    this.contract = contract;
    this.from = from;
  }

  async getArtworkCount(user: string): Promise<number | StatusMessage> {
    const tag = '<GetArtworkCount>';
    try {
      const res = await this.contract.methods.getArtworkCount(user).call();
      return +res.toString();
    } catch (e) {
      return resolveAsStatusMessage(tag, e);
    }
  }

  async getMyArtworkCount(): Promise<number | StatusMessage> {
    return this.getArtworkCount(this.from);
  }

  async getArtwork(user: string, index: number): Promise<ArtworkEntry | StatusMessage> {
    const tag = '<GetArtwork>';
    try {
      return await this.contract.methods.getArtwork(user, index).call();
    } catch (e) {
      return resolveAsStatusMessage(tag, e);
    }
  }

  async getMyArtwork(index: number): Promise<ArtworkEntry | StatusMessage> {
    return this.getArtwork(this.from, index);
  }

  async addArtwork({
    name,
    description,
    author,
    hash,
    locationUri = ''
  }: ArtworkEntry): Promise<string | StatusMessage> {
    const tag = '<AddArtwork>';
    try {
      const res = await this.contract.methods
        .addArtwork(name, description, author, hash, locationUri)
        .send({ from: this.from });
      return res.toString().toLowerCase();
    } catch (e) {
      return resolveAsStatusMessage(tag, e);
    }
  }

  async setLocationUri(index: number, locationUri = ''): Promise<string | StatusMessage> {
    const tag = '<SetLocationUri>';
    try {
      const res = await this.contract.methods.setLocationUri(index, locationUri).send({ from: this.from });
      return res.toString().toLowerCase();
    } catch (e) {
      return resolveAsStatusMessage(tag, e);
    }
  }
}
