// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Administrable {
    mapping(address => bool) _admins;

    constructor(address[] memory initialAdmins) {
        for (uint i; i < initialAdmins.length; i++) {
            _admins[initialAdmins[i]] = true;
        }
    }

    modifier onlyAdmins {
        require(_admins[msg.sender], "Address not allowed to call this method");
        _;
    }

    function isAdmin(address _address) public view returns(bool) {
        return _admins[_address];
    }

    function addAdmin(address _newAdmin) public onlyAdmins {
        _admins[_newAdmin] = true;
    }

    function removeAdmin(address _admin) public onlyAdmins {
        _admins[_admin] = false;
    }
}