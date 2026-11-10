# Encryption Breakdown

Blockchain is inherently not about encryption rather then about hashes and signature. But some components offer as a 'side effect' data encryption possibilities. Here a list encryption components used in this project:



## Local Storage Wallet

For convenience an account and its private key are saved in the Local Storage using the "ethers" (npm component) wallet with a user defined login password.






### Key Encryption

A secondary or shared key for encryption of data is used in 

'Private Message Store'


### Key Generation

For key generation (a public and a private one) nacl is used.

Is nacl save? Here the breakdown:

