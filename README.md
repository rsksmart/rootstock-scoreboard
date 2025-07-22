[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/rsksmart/rootstock-scoreboard/badge)](https://scorecard.dev/viewer/?uri=github.com/rsksmart/rootstock-scoreboard)
[![CodeQL](https://github.com/rsksmart/rskj/workflows/CodeQL/badge.svg)](https://github.com/rsksmart/rootstock-scoreboard/actions?query=workflow%3ACodeQL)
<img src="img/rootstock-logo.png" alt="RSK Logo" style="width:100%; height: auto;" />

# Governance Voting Dashboard

This project is a voting dashboard built using Next.js and integrated with Rootstock Network (EVM compatible smart contracts). It allows users to create teams and vote using governance tokens (ERC20) with advanced role-based administration. The voting process is controlled by the `TeamsManagerCore` smart contract, which manages the creation of teams and tracks the votes.

## Features

### Core Voting Features
- **Create Teams**: Users can create new teams by providing a team name, a meme token address, and a team leader address.
- **Vote for Teams**: Users can vote for their preferred team using governance tokens with configurable limits.
- **Real-time Leaderboard**: Track team scores and user participation with comprehensive vote tracking.
- **Token Balance**: The system tracks the voting token balance of the team leaders.
- **Smart Contracts Integration**: The project uses smart contracts for handling votes, team management, and governance token transactions.
- **ERC20 Support**: The voting process is based on ERC20 tokens, ensuring decentralized governance.
- **Time-bounded Voting**: Configurable voting periods with automatic deadline enforcement.
- **Anti-Gaming Protection**: Prevents team leaders from voting for their own teams.

### Advanced Role-Based Administration

The system implements a sophisticated **5-tier role hierarchy** for secure governance and administration:

#### Admin Role Hierarchy
```
SUPER_ADMIN (4)     → Full system control & oversight
├── RECOVERY_ADMIN (3)  → Emergency functions & crisis management  
├── VOTE_ADMIN (2)      → Voting system configuration & management
└── TEAM_MANAGER (1)    → Team creation & team lifecycle management
    └── NONE (0)        → Regular users with no admin privileges
```

#### Role Permissions

**SUPER_ADMIN (Level 4)**
- Complete administrative oversight and system control
- Add, remove, and modify all admin roles
- Resolve emergency mode situations and perform system resets
- Override authority for any system operation

**RECOVERY_ADMIN (Level 3)**
- Trigger system-wide emergency mode during crisis situations
- Emergency token withdrawals and fund recovery operations
- Add emergency admins during critical situations
- Limited to crisis management (cannot modify normal operations)

**VOTE_ADMIN (Level 2)**
- Enable/disable voting periods and configure voting durations
- Set voting parameters including token limits and minimum amounts
- Configure governance tokens and voting mechanics
- Manage voting system configuration

**TEAM_MANAGER (Level 1)**
- Add new teams to the voting system
- Remove or deactivate existing teams
- Update team details and metadata
- Manage team leader assignments

**NONE (Level 0)**
- Cast votes for preferred teams using governance tokens
- View team information and voting status
- No administrative privileges

## Smart Contract: TeamsManagerCore

The core of the project revolves around the `TeamsManagerCore` smart contract (found in Contracts folder), written in Solidity. This contract manages team creation, voting, and tracking the votes with role-based access control. Below is a high-level description of the contract:

### Main Functions

**Voting Functions:**
- `vote(teamName, transferAmount)`: Allows users to vote for a team by transferring governance tokens.
- `setReadyToVote(duration)`: Marks the contract as ready for voting with optional time limit (VOTE_ADMIN+ only).
- `disableVoting()`: Disables voting (VOTE_ADMIN+ only).
- `setVotingLimits(minAmount, maxAmount)`: Configure voting limits (VOTE_ADMIN+ only).

**Team Management Functions:**
- `addTeam(teamName, memeTokenAddress, teamLeaderAddress)`: Allows administrators to add a new team (TEAM_MANAGER+ only).
- `removeTeam(teamName)`: Remove/deactivate a team (TEAM_MANAGER+ only).

**View Functions:**
- `getTeamNames()`: Returns a list of all registered teams.
- `getTeamInfo(teamName)`: Provides detailed information about a team.
- `getScore(teamName)`: Retrieves the current vote score of a team.
- `getUserVoteForTeam(user, teamName)`: Get individual user's votes for specific team.
- `getUserTotalVotes(user)`: Get total votes cast by a user.
- `getVotingStatus()`: Returns current voting state and statistics.

**Admin Functions:**
- `addAdmin(address, role)`: Add new administrator with specific role (SUPER_ADMIN only).
- `removeAdmin(address)`: Remove administrator (SUPER_ADMIN only).
- `changeAdminRole(address, newRole)`: Change admin's role (SUPER_ADMIN only).
- `triggerEmergency()`: Activate emergency mode (RECOVERY_ADMIN only).
- `reset()`: Resets the voting state and team information (SUPER_ADMIN only).
- `emergencyWithdraw(token, to, amount)`: Emergency token withdrawal (RECOVERY_ADMIN+ only).

## Environment Variables

The project requires the following environment variables to function correctly. These should be set in your `.env` file:

```env
NEXT_PUBLIC_TEAM_MANAGER_ADDRESS=<Smart contract address for the TeamsManagerCore>
NEXT_PUBLIC_RPC_URL=<Ethereum network RPC URL>
NEXT_PUBLIC_EXPLORER=<Blockchain explorer URL>
NEXT_PUBLIC_PINATA_URL=<Pinata URL for IPFS data>
NEXT_PUBLIC_GOVERNANCE_TOKEN=<Governance token contract address>
```

## Prerequisites

- **Node.js**: Make sure you have Node.js installed.
- **Metamask or Web3 Wallet**: A Web3 wallet is required for signing transactions and interacting with the blockchain.
- **Governance Tokens**: ERC-20 tokens for voting (configurable).

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   ```

2. **Install the dependencies:**
   ```bash
   npm install
   ```

3. **Create a `.env` file and populate it with the environment variables listed above.**

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open http://localhost:3000 to view the dashboard.**

## Smart Contract Deployment

The `TeamsManagerCore` contract should be deployed to the Rootstock network, and its address should be provided in the `NEXT_PUBLIC_TEAM_MANAGER_ADDRESS` environment variable. The contract source code can be found in the `contracts` directory.

### Deployment Steps

1. **Compile contracts:**
   ```bash
   npx hardhat compile
   ```

2. **Run tests:**
   ```bash
   npx hardhat test
   ```
## Testing

The project includes comprehensive test coverage with 90+ test cases across all contracts:

```bash
# Run all tests
npx hardhat test

# Test individual contracts
npx hardhat test test/Administrable.test.js      # Basic admin management
npx hardhat test test/TeamsManager.test.js       # Core voting system
npx hardhat test test/AdvancedGovernance.test.js # Complex governance features
```

---


# Disclaimer
The software provided in this GitHub repository is offered “as is,” without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and non-infringement.
- **Testing:** The software has not undergone testing of any kind, and its functionality, accuracy, reliability, and suitability for any purpose are not guaranteed.
- **Use at Your Own Risk:** The user assumes all risks associated with the use of this software. The author(s) of this software shall not be held liable for any damages, including but not limited to direct, indirect, incidental, special, consequential, or punitive damages arising out of the use of or inability to use this software, even if advised of the possibility of such damages.
- **No Liability:** The author(s) of this software are not liable for any loss or damage, including without limitation, any loss of profits, business interruption, loss of information or data, or other pecuniary loss arising out of the use of or inability to use this software.
- **Sole Responsibility:** The user acknowledges that they are solely responsible for the outcome of the use of this software, including any decisions made or actions taken based on the software’s output or functionality.
- **No Endorsement:** Mention of any specific product, service, or organization does not constitute or imply endorsement by the author(s) of this software.
- **Modification and Distribution:** This software may be modified and distributed under the terms of the license provided with the software. By modifying or distributing this software, you agree to be bound by the terms of the license.
- **Assumption of Risk:** By using this software, the user acknowledges and agrees that they have read, understood, and accepted the terms of this disclaimer and assumes all risks associated with the use of this software.