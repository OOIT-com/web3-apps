export const publicKeyStoreAbi = [
  {
    inputs: [],
    name: 'MAX_LENGTH',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_address',
        type: 'address'
      }
    ],
    name: 'get',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getMine',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_publicKey',
        type: 'string'
      }
    ],
    name: 'set',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;
export const publicKeyStoreBytecode =
  '0x608060405234801561001057600080fd5b5061076f806100206000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c80634ed3885e14610051578063a6f9885c1461006d578063c2bc2efc1461008b578063cd008f1a146100bb575b600080fd5b61006b60048036038101906100669190610460565b6100d9565b005b610075610174565b604051610082919061056b565b60405180910390f35b6100a560048036038101906100a09190610437565b610179565b6040516100b29190610529565b60405180910390f35b6100c3610249565b6040516100d09190610529565b60405180910390f35b60808151111561011e576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016101159061054b565b60405180910390fd5b806000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000209080519060200190610170929190610317565b5050565b608081565b60606000808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002080546101c490610681565b80601f01602080910402602001604051908101604052809291908181526020018280546101f090610681565b801561023d5780601f106102125761010080835404028352916020019161023d565b820191906000526020600020905b81548152906001019060200180831161022057829003601f168201915b50505050509050919050565b60606000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020805461029490610681565b80601f01602080910402602001604051908101604052809291908181526020018280546102c090610681565b801561030d5780601f106102e25761010080835404028352916020019161030d565b820191906000526020600020905b8154815290600101906020018083116102f057829003601f168201915b5050505050905090565b82805461032390610681565b90600052602060002090601f016020900481019282610345576000855561038c565b82601f1061035e57805160ff191683800117855561038c565b8280016001018555821561038c579182015b8281111561038b578251825591602001919060010190610370565b5b509050610399919061039d565b5090565b5b808211156103b657600081600090555060010161039e565b5090565b60006103cd6103c8846105b7565b610586565b9050828152602081018484840111156103e557600080fd5b6103f084828561063f565b509392505050565b60008135905061040781610722565b92915050565b600082601f83011261041e57600080fd5b813561042e8482602086016103ba565b91505092915050565b60006020828403121561044957600080fd5b6000610457848285016103f8565b91505092915050565b60006020828403121561047257600080fd5b600082013567ffffffffffffffff81111561048c57600080fd5b6104988482850161040d565b91505092915050565b60006104ac826105e7565b6104b681856105f2565b93506104c681856020860161064e565b6104cf81610711565b840191505092915050565b60006104e76015836105f2565b91507f5075626c69634b657920697320746f6f206c6f6e6700000000000000000000006000830152602082019050919050565b61052381610635565b82525050565b6000602082019050818103600083015261054381846104a1565b905092915050565b60006020820190508181036000830152610564816104da565b9050919050565b6000602082019050610580600083018461051a565b92915050565b6000604051905081810181811067ffffffffffffffff821117156105ad576105ac6106e2565b5b8060405250919050565b600067ffffffffffffffff8211156105d2576105d16106e2565b5b601f19601f8301169050602081019050919050565b600081519050919050565b600082825260208201905092915050565b600061060e82610615565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b82818337600083830152505050565b60005b8381101561066c578082015181840152602081019050610651565b8381111561067b576000848401525b50505050565b6000600282049050600182168061069957607f821691505b602082108114156106ad576106ac6106b3565b5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6000601f19601f8301169050919050565b61072b81610603565b811461073657600080fd5b5056fea26469706673582212205f4f008e45c4781e947befeadef1422fbabb408aeee58f43494942b3e0b5a12664736f6c63430008000033';
