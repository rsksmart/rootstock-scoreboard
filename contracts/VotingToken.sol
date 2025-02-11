// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract VotingToken is ERC20 {
    string private _uri;

    constructor(uint256 initialSupply, string memory uri) ERC20("VotingToken", "VOTE") {
        _mint(msg.sender, initialSupply);
        _uri = uri;
    }

    function getUri() external view returns (string memory) {
        return _uri;
    }
}