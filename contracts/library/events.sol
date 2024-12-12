library Events {
    event TeamAddedSuccessfully(string teamName, address memeTokenAddress, address teamLeaderAddress);
    event TeamVotedSuccessfully(string teamName, uint256 transferAmount);
    event TeamResetSuccessfully();
    event VotingTokenSetSuccessfully(address votingTokenAddress);   
}


