// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Administrable.sol";

struct TeamInfo {
    string teamName;
    string memeTokenName;
    string memeTokenUri;
    address memeTokenAddress;
    address teamLeaderAddress;
    uint256 score;
    uint256 createdAt;
    bool isActive;
}

interface IMemeToken {
    function getUri() external view returns (string memory);
    function name() external view returns (string memory);
}

/**
 * @title Core TeamsManager Contract
 * @dev Essential team management and voting functionality only
 */
contract TeamsManagerCore is ReentrancyGuard, Administrable {

    // ============ STATE VARIABLES ============

    IERC20 public votingTokenContract;
    bool public readyToVote = false;
    string[] public teamNames;

    mapping(address => string) public teamLeaders;
    mapping(string => TeamInfo) public teams;
    mapping(address => mapping(string => uint256)) public userVotes;
    mapping(address => uint256) public totalUserVotes;

    uint256 public totalVotes;
    uint256 public votingStartTime;
    uint256 public votingEndTime;
    uint256 public minimumVoteAmount = 1 * 10**18;
    uint256 public maxVotePerUser = 10000 * 10**18;

    // ============ EVENTS ============

    event TeamAdded(string indexed teamName, address indexed memeToken, address indexed teamLeader);
    event TeamRemoved(string indexed teamName, address indexed teamLeader);
    event VoteCast(address indexed voter, string indexed teamName, uint256 amount);
    event VotingEnabled(uint256 startTime, uint256 endTime);
    event VotingDisabled();
    event VotingTokenSet(address indexed token);
    event SystemReset(address indexed admin);

    // ============ MODIFIERS ============

    modifier votingActive() {
        require(readyToVote, "Voting is not ready yet");
        require(block.timestamp >= votingStartTime, "Voting has not started");
        require(votingEndTime == 0 || block.timestamp <= votingEndTime, "Voting has ended");
        _;
    }

    modifier validTeam(string memory teamName) {
        require(bytes(teams[teamName].teamName).length > 0, "Unknown team");
        require(teams[teamName].isActive, "Team is not active");
        _;
    }

    // ============ CONSTRUCTOR ============

    constructor(
        address[] memory initialAdmins,
        address stakingToken,
        uint256 minimumStake
    ) Administrable(initialAdmins) {
        // Note: stakingToken and minimumStake parameters kept for compatibility
        // but not used in simplified version
    }

    // ============ CORE VOTING FUNCTIONS ============

    function vote(
        string memory teamName, 
        uint256 transferAmount
    ) external nonReentrant votingActive validTeam(teamName) {
        require(transferAmount >= minimumVoteAmount, "Vote amount too small");
        require(transferAmount <= maxVotePerUser, "Vote amount exceeds maximum");
        require(
            totalUserVotes[msg.sender] + transferAmount <= maxVotePerUser,
            "Total votes would exceed maximum per user"
        );
        require(
            keccak256(abi.encodePacked(teamLeaders[msg.sender])) != keccak256(abi.encodePacked(teamName)), 
            "Cannot vote for own team"
        );

        require(
            votingTokenContract.transferFrom(msg.sender, address(this), transferAmount),
            "Token transfer failed"
        );

        teams[teamName].score += transferAmount;
        userVotes[msg.sender][teamName] += transferAmount;
        totalUserVotes[msg.sender] += transferAmount;
        totalVotes += transferAmount;

        emit VoteCast(msg.sender, teamName, transferAmount);
    }

    // ============ TEAM MANAGEMENT ============

    function addTeam(
        string memory teamName, 
        address memeTokenAddress, 
        address teamLeaderAddress
    ) external onlyRole(AdminRole.TEAM_MANAGER) notInEmergency {
        require(bytes(teamName).length > 0, "Team name cannot be empty");
        require(bytes(teams[teamName].teamName).length == 0, "Team already exists");
        require(bytes(teamLeaders[teamLeaderAddress]).length == 0, "Leader already assigned");
        require(memeTokenAddress != address(0), "Invalid token address");
        require(teamLeaderAddress != address(0), "Invalid team leader address");

        (string memory tokenName, string memory tokenUri) = _getTokenInfo(memeTokenAddress);

        teamNames.push(teamName);
        teamLeaders[teamLeaderAddress] = teamName;
        teams[teamName] = TeamInfo({
            teamName: teamName,
            memeTokenName: tokenName,
            memeTokenUri: tokenUri,
            memeTokenAddress: memeTokenAddress,
            teamLeaderAddress: teamLeaderAddress,
            score: 0,
            createdAt: block.timestamp,
            isActive: true
        });

        emit TeamAdded(teamName, memeTokenAddress, teamLeaderAddress);
    }

    function removeTeam(string memory teamName) external onlyRole(AdminRole.TEAM_MANAGER) notInEmergency {
        require(bytes(teams[teamName].teamName).length > 0, "Team does not exist");

        address teamLeader = teams[teamName].teamLeaderAddress;
        teams[teamName].isActive = false;
        teamLeaders[teamLeader] = "";

        // Remove from array
        for (uint256 i = 0; i < teamNames.length; i++) {
            if (keccak256(abi.encodePacked(teamNames[i])) == keccak256(abi.encodePacked(teamName))) {
                teamNames[i] = teamNames[teamNames.length - 1];
                teamNames.pop();
                break;
            }
        }

        emit TeamRemoved(teamName, teamLeader);
    }

    // ============ VOTING CONTROL ============

    function setReadyToVote(uint256 duration) external onlyRole(AdminRole.VOTE_ADMIN) {
        require(address(votingTokenContract) != address(0), "Voting token not set");
        require(teamNames.length > 0, "No teams available");

        readyToVote = true;
        votingStartTime = block.timestamp;
        votingEndTime = duration > 0 ? block.timestamp + duration : 0;

        emit VotingEnabled(votingStartTime, votingEndTime);
    }

    function disableVoting() external onlyRole(AdminRole.VOTE_ADMIN) {
        readyToVote = false;
        emit VotingDisabled();
    }

    function setVotingToken(address votingTokenAddress) external onlyRole(AdminRole.VOTE_ADMIN) {
        require(votingTokenAddress != address(0), "Invalid token address");
        votingTokenContract = IERC20(votingTokenAddress);
        emit VotingTokenSet(votingTokenAddress);
    }

    function setVotingLimits(uint256 minAmount, uint256 maxAmount) external onlyRole(AdminRole.VOTE_ADMIN) {
        require(minAmount > 0, "Minimum must be positive");
        require(maxAmount >= minAmount, "Maximum must be >= minimum");

        minimumVoteAmount = minAmount;
        maxVotePerUser = maxAmount;
    }

    // ============ SYSTEM MANAGEMENT ============

    function reset() external onlySuperAdmin {
        readyToVote = false;
        votingStartTime = 0;
        votingEndTime = 0;
        totalVotes = 0;

        for (uint256 i = 0; i < teamNames.length; i++) {
            string memory teamName = teamNames[i];
            address teamLeader = teams[teamName].teamLeaderAddress;
            teamLeaders[teamLeader] = "";
            delete teams[teamName];
        }

        delete teamNames;
        emit SystemReset(msg.sender);
    }

    function emergencyWithdraw(address token, address to, uint256 amount) external onlyRole(AdminRole.RECOVERY_ADMIN) {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        require(IERC20(token).transfer(to, amount), "Transfer failed");
    }

    // ============ ESSENTIAL VIEW FUNCTIONS ============

    function getTeamNames() external view returns (string[] memory) {
        return teamNames;
    }

    function getTeamInfo(string memory teamName) external view returns (TeamInfo memory) {
        return teams[teamName];
    }

    function getScore(string memory teamName) external view returns (uint256) {
        return teams[teamName].score;
    }

    function getUserVoteForTeam(address user, string memory teamName) external view returns (uint256) {
        return userVotes[user][teamName];
    }

    function getUserTotalVotes(address user) external view returns (uint256) {
        return totalUserVotes[user];
    }

    function getVotingStatus() external view returns (
        bool isActive,
        uint256 startTime,
        uint256 endTime,
        uint256 totalVotesCount,
        address votingToken
    ) {
        return (readyToVote, votingStartTime, votingEndTime, totalVotes, address(votingTokenContract));
    }

    // ============ INTERNAL HELPERS ============

    function _getTokenInfo(address tokenAddress) internal view returns (string memory name, string memory uri) {
        IMemeToken memeToken = IMemeToken(tokenAddress);

        try memeToken.name() returns (string memory tokenName) {
            name = tokenName;
        } catch {
            name = "Unknown Token";
        }

        try memeToken.getUri() returns (string memory tokenUri) {
            uri = tokenUri;
        } catch {
            uri = "";
        }
    }
}