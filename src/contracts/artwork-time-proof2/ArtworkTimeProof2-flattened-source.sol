// Sources flattened with hardhat v2.22.12 https://hardhat.org

// SPDX-License-Identifier: UNLICENSED

// File contracts/artwork-time-proof2/ArtworkTimeProof2.sol

// Original license: SPDX_License_Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract ArtworkTimeProof2 {

    event ArtworkAdded(
        address indexed user,
        string name,
        string indexed hash,
        uint timestamp
    );

    struct Artwork {
        string name;
        string description;
        string author;
        string hash;
        uint256 timestamp;
        string uploadInfo;
    }

    mapping(address => Artwork[]) public address2artwork;

    function addArtwork(
        string calldata _name,
        string calldata _description,
        string calldata _author,
        string calldata _hash,
        string calldata _uploadInfo
    ) external {
        Artwork memory newArtwork = Artwork({
            name: _name,
            description: _description,
            author: _author,
            hash: _hash,
            timestamp: block.timestamp,
            uploadInfo: _uploadInfo
        });
        Artwork[] storage artworks = address2artwork[msg.sender];
        artworks.push(newArtwork);
        emit ArtworkAdded(msg.sender, _name, _hash, block.timestamp);
    }

    function getArtworkCount(address _address) external view returns (uint256) {
        return address2artwork[_address].length;
    }

    function getArtwork(address _address, uint256 index) external view returns (Artwork memory) {
        return address2artwork[_address][index];
    }

    function setUploadInfo(uint256 index, string calldata _uploadInfo) external {
        Artwork storage artwork = address2artwork[msg.sender][index];
        artwork.uploadInfo = _uploadInfo;
    }
}
