// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Administrable.sol";

struct TeamInfo {
  string teamName;
  string memeTokenName;
  string memeTokenUri;
  address memeTokenAddress;
  address teamLeaderAddress;
  uint256 score;
}

interface IERC20 {
  function transferFrom(address sender, address recipient, uint256 amount) external returns(bool);
  function balanceOf(address account) external view returns (uint256);
  function getUri() external view returns (string memory);
  function name() external view returns (string memory);
}

contract TeamsManager is Administrable {
  IERC20 _votingTokenContract;
  bool _readyToVote = false;
  string[] _teamNames;
  mapping(address => string) _teamLeaders;
  mapping(string => TeamInfo) _teams;

  constructor(address[] memory initialAdmins) Administrable(initialAdmins) {}

  function vote(string memory teamName, uint256 transferAmount) public {
    require(bytes(_teams[teamName].teamName).length > 0, "Unkown team");
    require(keccak256(abi.encodePacked(_teamLeaders[msg.sender])) != keccak256(abi.encodePacked(teamName)), "Cannot vote for own team");

    _votingTokenContract.transferFrom(msg.sender, address(this), transferAmount);
    _teams[teamName].score += transferAmount;
  }

  function getTeamNames() external view returns(string[] memory) {
    return _teamNames;
  }

  function getTeamInfo(string memory teamName) public view returns(TeamInfo memory) {
    return _teams[teamName];
  }

  function getScore(string memory teamName) public view returns(uint256) {
    return _teams[teamName].score;
  }

  function getVotingTokenBalance(string memory teamName) public view returns(uint256) {
    address teamLeaderAddress = getTeamInfo(teamName).teamLeaderAddress;

    return _votingTokenContract.balanceOf(teamLeaderAddress);
  }

  function setReadyToVote() public onlyAdmins {
    _readyToVote = true;
  }

  function setVotingToken(address votingTokenAddress) public {
    _votingTokenContract = IERC20(votingTokenAddress);
  }

  function addTeam(string memory teamName, address memeTokenAddress, address teamLeaderAddress) public {
    require(bytes(_teams[teamName].teamName).length == 0, "Team already added");

    IERC20 memeTokenContract = IERC20(memeTokenAddress);
    string memory memeTokenName = memeTokenContract.name();
    string memory memeTokenUri = memeTokenContract.getUri();

    _teamNames.push(teamName);
    _teamLeaders[teamLeaderAddress] = teamName;
    _teams[teamName] = TeamInfo(teamName, memeTokenName, memeTokenUri, memeTokenAddress, teamLeaderAddress, 0);
  }

  function reset() public onlyAdmins {
    for (uint256 i; i < _teamNames.length; i++) {
      _readyToVote = false;
      _teamLeaders[_teams[_teamNames[i]].teamLeaderAddress] = "";
      _teams[_teamNames[i]] = TeamInfo("", "", "", address(0), address(0), 0);
    }
    _teamNames = [""];
  }
}