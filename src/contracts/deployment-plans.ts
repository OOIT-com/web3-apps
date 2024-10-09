import { DeploymentPlan } from './types';
import { contractRegistryAbi, contractRegistryBytecode } from './contract-registry/ContractRegistry-abi';
import { addressBookAbi, addressBookBytecode } from './contracts-flattened-compiled/AddressBook';
import { keyBlockAbi, keyBlockBytecode } from './key-block/KeyBlock-abi';
import { publicKeyStoreAbi, publicKeyStoreBytecode } from './public-key-store/PublicKeyStore-abi';
import { publicKeyStoreV2Abi, publicKeyStoreV2bytecode } from './public-key-store/PublicKeyStoreV2-abi';
import { artworkTimeProofAbi, artworkTimeProofBytecode } from './artwork-time-proof/ArtworkTimeProof';
import {
  secureBlockchainTableAbi,
  secureBlockchainTableBytecode
} from './secure-blockchain-table/SecureBlockchainTable';
import {
  universalNameStore_SourceCode,
  universalNameStoreAbi,
  universalNameStoreBytecode
} from './universal-name-store/UniversalNameStore';
import { ContractName } from './contract-utils';
import { deployPrivateMessageV2Contract } from './private-message-store/PrivateMessageStoreV2-support';

export const deploymentPlans: DeploymentPlan[] = [
  {
    label: 'Contract Registry',
    contractName: 'ContractRegistry',
    defaultRegistryName: 'ADDRESS_BOOK',
    contractType: 'ContractRegistry,OwnableWithBackup',
    contractABI: JSON.stringify(contractRegistryAbi),
    contractBytecode: contractRegistryBytecode,
    constructorArgDefs: []
  },
  {
    label: 'Address Book',
    contractName: 'AddressBook',
    defaultRegistryName: 'ADDRESS_BOOK',
    contractType: 'AddressBook,OwnableWithBackup',
    contractABI: JSON.stringify(addressBookAbi),
    contractBytecode: addressBookBytecode,
    constructorArgDefs: []
  },
  {
    label: 'Private Message Store V2',
    contractName: 'PrivateMessageStoreV2',
    defaultRegistryName: ContractName.PRIVATE_MESSAGE_STORE_V2,
    contractType: 'PrivateMessageStoreV2',
    deploymentFunction: deployPrivateMessageV2Contract
  },
  {
    label: 'Secret Vault (Key Block)',
    contractName: 'KeyBlock',
    defaultRegistryName: 'KEY_BLOCK',
    contractType: 'KeyBlock',
    contractABI: JSON.stringify(keyBlockAbi),
    contractBytecode: keyBlockBytecode,
    constructorArgDefs: []
  },
  {
    label: 'Public Key Store',
    contractName: 'PublicKeyStore',
    defaultRegistryName: ContractName.PUBLIC_KEY_STORE,
    contractType: 'PublicKeyStore',
    contractABI: JSON.stringify(publicKeyStoreAbi),
    contractBytecode: publicKeyStoreBytecode,
    constructorArgDefs: []
  },
  {
    label: 'Public Key Store V2',
    contractName: 'PublicKeyStoreV2',
    defaultRegistryName: ContractName.PUBLIC_KEY_STORE_V2,
    contractType: 'PublicKeyStoreV2',
    contractABI: JSON.stringify(publicKeyStoreV2Abi),
    contractBytecode: publicKeyStoreV2bytecode,
    constructorArgDefs: []
  },
  {
    label: 'Artwork Time Proof',
    contractName: 'ArtworkTimeProof',
    defaultRegistryName: ContractName.ARTWORK_TIME_PROOF,
    contractType: 'ArtworkTimeProof',
    contractABI: JSON.stringify(artworkTimeProofAbi),
    contractBytecode: artworkTimeProofBytecode,
    constructorArgDefs: []
  },
  {
    label: 'Salary Manager',
    contractName: 'SalaryManager',
    defaultRegistryName: ContractName.SALARY_MANAGER_,
    contractType: 'SalaryManager',
    contractABI: JSON.stringify(secureBlockchainTableAbi),
    contractBytecode: secureBlockchainTableBytecode,
    constructorArgDefs: []
  },
  {
    label: 'Universal Name Store',
    contractName: 'UniversalNameStore',
    defaultRegistryName: ContractName.UNIVERSAL_NAME_STORE,
    contractType: 'UniversalNameStore',
    contractABI: JSON.stringify(universalNameStoreAbi),
    contractBytecode: universalNameStoreBytecode,
    contractSourceCode: universalNameStore_SourceCode,
    constructorArgDefs: []
  }
];
