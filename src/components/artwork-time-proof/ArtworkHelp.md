# Artwork Time Proof

With the Artwork App you can create a timestamped entry on the blockchain with a link to a save storage on the Irys data
chain.

Here the features for an Artwork:

- Preserves timestamp and owner of the uploaded file in a ArtworkTimeProof contract
- Saves a file with optional encryption on the Irys data chain

## ArtworkTimeProof Attributes: 
- Name
- Description
- Uploaded file
- Encryption
- Author (proof of authorship)
- Created Timestamp (proof of time)
- Hash of uploaded file (proof of content)
  
## Encryption Type

For the encryption of the art work file the following options exist:
- **no encryption**: The art work file is saved as provided.
- **account private key**: The private key associated with the user is used for encryption of the art work file.
- **secret key from store**: An independent key from the secret store - encrypted with the private key - is used for encryption of the art work file.
- **new key**: A newly generated key is used exclusively for one art work file. **Important**: Fhe key has to be store by the user himeself!



# Tab Description

- *List all your Artwork Time Proof*: List all Artwork Time Proofs entries created.
- *Create Artwork Time Proof*: create a secure time entry on the the blockchain.
- *Encrypt*: Provide a file, encrypt it and download it including the metadata with privateKey key and hash.
- *Decrpyt* : Decrypt the file.

All processing is done locally on your browser memory *no data* is stored or uploaded to any site or kept in a local
storage!
There is a file size limit due to the browser (On Chrome: currently c.a. 50 MB).
