[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/rsksmart/rootstock-scoreboard/badge)](https://scorecard.dev/viewer/?uri=github.com/rsksmart/rootstock-scoreboard)
[![CodeQL](https://github.com/rsksmart/rskj/workflows/CodeQL/badge.svg)](https://github.com/rsksmart/rootstock-scoreboard/actions?query=workflow%3ACodeQL)
<img src="img/rootstock-logo.png" alt="RSK Logo" style="width:100%; height: auto;" />

# Governance Voting Dashboard

This project is a voting dashboard built using Next.js and integrated with Rootstock Network (EVM compatible smart contracts). It allows users to create teams and vote using governance tokens (ERC20). The voting process is controlled by the `TeamsManager` smart contract, which manages the creation of teams and tracks the votes.

## Features

- **Create Teams**: Users can create new teams by providing a team name, a meme token address, and a team leader address.
- **Vote for Teams**: Users can vote for their preferred team using governance tokens.
- **Token Balance**: The system tracks the voting token balance of the team leaders.
- **Smart Contracts Integration**: The project uses smart contracts for handling votes, team management, and governance token transactions.
- **ERC20 Support**: The voting process is based on ERC20 tokens, ensuring decentralized governance.

## Smart Contract: TeamsManager

The core of the project revolves around the `TeamsManager` smart contract (found in Contracts folder), written in Solidity. This contract manages team creation, voting, and tracking the votes. Below is a high-level description of the contract:

### Functions

- **vote(teamName, transferAmount)**: Allows users to vote for a team by transferring governance tokens.
- **getTeamNames()**: Returns a list of all registered teams.
- **getTeamInfo(teamName)**: Provides detailed information about a team.
- **getScore(teamName)**: Retrieves the current vote score of a team.
- **addTeam(teamName, memeTokenAddress, teamLeaderAddress)**: Allows administrators to add a new team.
- **setReadyToVote()**: Marks the contract as ready for voting (only callable by admins).
- **reset()**: Resets the voting state and team information (only callable by admins).

## Environment Variables

The project requires the following environment variables to function correctly. These should be set in your `.env` file:

```bash
NEXT_PUBLIC_TEAM_MANAGER_ADDRESS=<Smart contract address for the TeamsManager>
NEXT_PUBLIC_RPC_URL=<Ethereum network RPC URL>
NEXT_PUBLIC_EXPLORER=<Blockchain explorer URL>
NEXT_PUBLIC_PINATA_URL=<Pinata URL for IPFS data>
NEXT_PUBLIC_GOVERNANCE_TOKEN=<Governance token contract address>
```


## Prerequisites

- **Node.js**: Make sure you have Node.js installed.
- **Metamask or Web3 Wallet**: A Web3 wallet is required for signing transactions and interacting with the blockchain.

## Getting Started

1. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file and populate it with the environment variables listed above.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Smart Contract Deployment

The `TeamsManager` contract should be deployed to the Rootstock testnet network, and its address should be provided in the `NEXT_PUBLIC_TEAM_MANAGER_ADDRESS` environment variable. The contract source code can be found in the `contracts` directory.

The variable `NEXT_PUBLIC_GOVERNANCE_TOKEN` should contain the address of the ERC20 token used for voting.

# Disclaimer
The software provided in this GitHub repository is offered “as is,” without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and non-infringement.
- **Testing:** The software has not undergone testing of any kind, and its functionality, accuracy, reliability, and suitability for any purpose are not guaranteed.
- **Use at Your Own Risk:** The user assumes all risks associated with the use of this software. The author(s) of this software shall not be held liable for any damages, including but not limited to direct, indirect, incidental, special, consequential, or punitive damages arising out of the use of or inability to use this software, even if advised of the possibility of such damages.
- **No Liability:** The author(s) of this software are not liable for any loss or damage, including without limitation, any loss of profits, business interruption, loss of information or data, or other pecuniary loss arising out of the use of or inability to use this software.
- **Sole Responsibility:** The user acknowledges that they are solely responsible for the outcome of the use of this software, including any decisions made or actions taken based on the software’s output or functionality.
- **No Endorsement:** Mention of any specific product, service, or organization does not constitute or imply endorsement by the author(s) of this software.
- **Modification and Distribution:** This software may be modified and distributed under the terms of the license provided with the software. By modifying or distributing this software, you agree to be bound by the terms of the license.
- **Assumption of Risk:** By using this software, the user acknowledges and agrees that they have read, understood, and accepted the terms of this disclaimer and assumes all risks associated with the use of this software.