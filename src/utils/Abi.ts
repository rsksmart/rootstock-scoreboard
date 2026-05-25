export const ABI_ERC20 = [
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) public returns (bool)"
];

export const ABI_TEAMS_MANAGER = [
  "function getTeamNames() view returns (string[])",
  "function getTeamInfo(string teamName) view returns (tuple(string teamName, string memeTokenName, string memeTokenUri, address memeTokenAddress, address teamLeaderAddress, uint256 score, uint256 createdAt, bool isActive))",
  "function getScore(string teamName) view returns (uint256)",
  "function vote(string teamName, uint256 transferAmount)",
  "function addTeam(string teamName, address memeTokenAddress, address teamLeaderAddress)",
  "function setReadyToVote(uint256 duration)",
  "function getVotingStatus() view returns (bool isActive, uint256 startTime, uint256 endTime, uint256 totalVotesCount, address votingToken)",
  "function getAdminRole(address _address) view returns (uint8)",
  "function emergencyAddAdmin(address admin, uint8 role)",
  "function addAdmin(address newAdmin, uint8 role)",
  "function emergencyMode() view returns (bool)",
  "function triggerEmergency()",
  "function resolveEmergency()",
  "function emergencyWithdraw(address token, address to, uint256 amount)"
];
