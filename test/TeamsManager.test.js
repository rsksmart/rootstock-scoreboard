const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("TeamsManagerCore - Essential Tests", function () {
  let teamsManager;
  let votingToken;
  let memeToken1, memeToken2;
  let owner, admin1, admin2, teamLeader1, teamLeader2, voter1, voter2, nonAdmin;

  // Admin role enum values
  const AdminRole = {
    NONE: 0,
    TEAM_MANAGER: 1,
    VOTE_ADMIN: 2,
    RECOVERY_ADMIN: 3,
    SUPER_ADMIN: 4,
  };

  beforeEach(async function () {
    [
      owner,
      admin1,
      admin2,
      teamLeader1,
      teamLeader2,
      voter1,
      voter2,
      nonAdmin,
    ] = await ethers.getSigners();

    // Deploy mock ERC20 token for voting
    const MockToken = await ethers.getContractFactory("MockERC20");
    votingToken = await MockToken.deploy(
      "Voting Token",
      "VOTE",
      ethers.parseEther("1000000"),
    );
    await votingToken.waitForDeployment();

    // Deploy mock meme tokens
    memeToken1 = await MockToken.deploy(
      "Meme Token 1",
      "MEME1",
      ethers.parseEther("1000000"),
    );
    await memeToken1.waitForDeployment();

    memeToken2 = await MockToken.deploy(
      "Meme Token 2",
      "MEME2",
      ethers.parseEther("1000000"),
    );
    await memeToken2.waitForDeployment();

    // Deploy TeamsManagerCore contract
    const TeamsManagerCore =
      await ethers.getContractFactory("TeamsManagerCore");
    teamsManager = await TeamsManagerCore.deploy(
      [owner.address, admin1.address, admin2.address],
      ethers.ZeroAddress, // stakingToken not used in simplified version
      0, // minimumStake not used in simplified version
    );
    await teamsManager.waitForDeployment();

    // Set voting token
    await teamsManager
      .connect(owner)
      .setVotingToken(await votingToken.getAddress());

    // Transfer voting tokens to voters
    await votingToken.transfer(voter1.address, ethers.parseEther("10000"));
    await votingToken.transfer(voter2.address, ethers.parseEther("10000"));

    // Approve voting tokens
    await votingToken
      .connect(voter1)
      .approve(await teamsManager.getAddress(), ethers.parseEther("10000"));
    await votingToken
      .connect(voter2)
      .approve(await teamsManager.getAddress(), ethers.parseEther("10000"));
  });

  describe("🏗️ Contract Deployment", function () {
    it("Should deploy with correct initial setup", async function () {
      expect(await teamsManager.totalAdmins()).to.equal(3);
      expect(await teamsManager.isAdmin(owner.address)).to.be.true;
      expect(await teamsManager.getAdminRole(owner.address)).to.equal(
        AdminRole.SUPER_ADMIN,
      );
      expect(await teamsManager.readyToVote()).to.be.false;
    });

    it("Should have empty team list initially", async function () {
      const teamNames = await teamsManager.getTeamNames();
      expect(teamNames).to.have.lengthOf(0);
    });
  });

  describe("👥 Team Management", function () {
    beforeEach(async function () {
      // Change admin1 to TEAM_MANAGER role using simplified method
      await teamsManager
        .connect(owner)
        .changeAdminRole(admin1.address, AdminRole.TEAM_MANAGER);
    });

    it("Should allow TEAM_MANAGER to add teams", async function () {
      await expect(
        teamsManager
          .connect(admin1)
          .addTeam(
            "Team Alpha",
            await memeToken1.getAddress(),
            teamLeader1.address,
          ),
      )
        .to.emit(teamsManager, "TeamAdded")
        .withArgs(
          "Team Alpha",
          await memeToken1.getAddress(),
          teamLeader1.address,
        );

      const teamNames = await teamsManager.getTeamNames();
      expect(teamNames).to.include("Team Alpha");

      const teamInfo = await teamsManager.getTeamInfo("Team Alpha");
      expect(teamInfo.teamName).to.equal("Team Alpha");
      expect(teamInfo.memeTokenAddress).to.equal(await memeToken1.getAddress());
      expect(teamInfo.teamLeaderAddress).to.equal(teamLeader1.address);
      expect(teamInfo.isActive).to.be.true;
    });

    it("Should prevent non-TEAM_MANAGER from adding teams", async function () {
      // Test 1: Non-admin should be rejected
      await expect(
        teamsManager
          .connect(nonAdmin)
          .addTeam(
            "Team Beta",
            await memeToken1.getAddress(),
            teamLeader1.address,
          ),
      ).to.be.revertedWith("Insufficient admin privileges");

      // Test 2: Admin with TEAM_MANAGER or higher role should be able to add teams
      // (admin2 is SUPER_ADMIN by default, so this should work)
      await expect(
        teamsManager
          .connect(admin2)
          .addTeam(
            "Team Beta",
            await memeToken1.getAddress(),
            teamLeader2.address,
          ),
      ).to.emit(teamsManager, "TeamAdded");

      // Test 3: Removed admin should not be able to add teams
      await teamsManager
        .connect(owner)
        .addAdmin(teamLeader1.address, AdminRole.TEAM_MANAGER);
      await teamsManager.connect(owner).removeAdmin(teamLeader1.address);

      await expect(
        teamsManager
          .connect(teamLeader1)
          .addTeam("Team Gamma", await memeToken2.getAddress(), voter1.address),
      ).to.be.revertedWith("Insufficient admin privileges");
    });

    it("Should prevent duplicate team names", async function () {
      await teamsManager
        .connect(admin1)
        .addTeam(
          "Team Alpha",
          await memeToken1.getAddress(),
          teamLeader1.address,
        );

      await expect(
        teamsManager.connect(admin1).addTeam(
          "Team Alpha", // Same name
          await memeToken2.getAddress(),
          teamLeader2.address,
        ),
      ).to.be.revertedWith("Team already exists");
    });

    it("Should prevent duplicate team leaders", async function () {
      await teamsManager
        .connect(admin1)
        .addTeam(
          "Team Alpha",
          await memeToken1.getAddress(),
          teamLeader1.address,
        );

      await expect(
        teamsManager.connect(admin1).addTeam(
          "Team Beta",
          await memeToken2.getAddress(),
          teamLeader1.address, // Same leader
        ),
      ).to.be.revertedWith("Leader already assigned");
    });

    it("Should allow TEAM_MANAGER to remove teams", async function () {
      await teamsManager
        .connect(admin1)
        .addTeam(
          "Team Alpha",
          await memeToken1.getAddress(),
          teamLeader1.address,
        );

      await expect(teamsManager.connect(admin1).removeTeam("Team Alpha"))
        .to.emit(teamsManager, "TeamRemoved")
        .withArgs("Team Alpha", teamLeader1.address);

      const teamInfo = await teamsManager.getTeamInfo("Team Alpha");
      expect(teamInfo.isActive).to.be.false;

      const teamNames = await teamsManager.getTeamNames();
      expect(teamNames).to.not.include("Team Alpha");
    });

    it("Should validate team input parameters", async function () {
      await expect(
        teamsManager
          .connect(admin1)
          .addTeam("", await memeToken1.getAddress(), teamLeader1.address),
      ).to.be.revertedWith("Team name cannot be empty");

      await expect(
        teamsManager
          .connect(admin1)
          .addTeam("Team Alpha", ethers.ZeroAddress, teamLeader1.address),
      ).to.be.revertedWith("Invalid token address");

      await expect(
        teamsManager
          .connect(admin1)
          .addTeam(
            "Team Alpha",
            await memeToken1.getAddress(),
            ethers.ZeroAddress,
          ),
      ).to.be.revertedWith("Invalid team leader address");
    });
  });

  describe("🗳️ Voting System", function () {
    beforeEach(async function () {
      // Setup admin roles using simplified method
      await teamsManager
        .connect(owner)
        .changeAdminRole(admin1.address, AdminRole.TEAM_MANAGER);
      await teamsManager
        .connect(owner)
        .changeAdminRole(admin2.address, AdminRole.VOTE_ADMIN);

      // Add teams
      await teamsManager
        .connect(admin1)
        .addTeam(
          "Team Alpha",
          await memeToken1.getAddress(),
          teamLeader1.address,
        );
      await teamsManager
        .connect(admin1)
        .addTeam(
          "Team Beta",
          await memeToken2.getAddress(),
          teamLeader2.address,
        );
    });

    it("Should allow VOTE_ADMIN to enable voting", async function () {
      const duration = 3600; // 1 hour

      await expect(
        teamsManager.connect(admin2).setReadyToVote(duration),
      ).to.emit(teamsManager, "VotingEnabled");

      expect(await teamsManager.readyToVote()).to.be.true;

      const votingStatus = await teamsManager.getVotingStatus();
      expect(votingStatus.isActive).to.be.true;
      expect(votingStatus.votingToken).to.equal(await votingToken.getAddress());
    });

    it("Should allow VOTE_ADMIN to disable voting", async function () {
      await teamsManager.connect(admin2).setReadyToVote(3600);

      await expect(teamsManager.connect(admin2).disableVoting()).to.emit(
        teamsManager,
        "VotingDisabled",
      );

      expect(await teamsManager.readyToVote()).to.be.false;
    });

    it("Should allow users to vote for teams", async function () {
      await teamsManager.connect(admin2).setReadyToVote(3600);
      const voteAmount = ethers.parseEther("100");

      await expect(teamsManager.connect(voter1).vote("Team Alpha", voteAmount))
        .to.emit(teamsManager, "VoteCast")
        .withArgs(voter1.address, "Team Alpha", voteAmount);

      expect(await teamsManager.getScore("Team Alpha")).to.equal(voteAmount);
      expect(
        await teamsManager.getUserVoteForTeam(voter1.address, "Team Alpha"),
      ).to.equal(voteAmount);
      expect(await teamsManager.getUserTotalVotes(voter1.address)).to.equal(
        voteAmount,
      );
    });

    it("Should prevent voting when not ready", async function () {
      const voteAmount = ethers.parseEther("100");

      await expect(
        teamsManager.connect(voter1).vote("Team Alpha", voteAmount),
      ).to.be.revertedWith("Voting is not ready yet");
    });

    it("Should prevent team leaders from voting for their own team", async function () {
      await teamsManager.connect(admin2).setReadyToVote(3600);
      await votingToken.transfer(
        teamLeader1.address,
        ethers.parseEther("1000"),
      );
      await votingToken
        .connect(teamLeader1)
        .approve(await teamsManager.getAddress(), ethers.parseEther("1000"));

      const voteAmount = ethers.parseEther("100");

      await expect(
        teamsManager.connect(teamLeader1).vote("Team Alpha", voteAmount),
      ).to.be.revertedWith("Cannot vote for own team");
    });

    it("Should enforce voting limits", async function () {
      await teamsManager.connect(admin2).setReadyToVote(3600);

      // Test minimum vote amount
      await expect(
        teamsManager
          .connect(voter1)
          .vote("Team Alpha", ethers.parseEther("0.5")),
      ).to.be.revertedWith("Vote amount too small");

      // Test maximum vote amount
      await expect(
        teamsManager
          .connect(voter1)
          .vote("Team Alpha", ethers.parseEther("15000")),
      ).to.be.revertedWith("Vote amount exceeds maximum");
    });

    it("Should allow VOTE_ADMIN to set voting limits", async function () {
      const newMin = ethers.parseEther("5");
      const newMax = ethers.parseEther("5000");

      await teamsManager.connect(admin2).setVotingLimits(newMin, newMax);

      expect(await teamsManager.minimumVoteAmount()).to.equal(newMin);
      expect(await teamsManager.maxVotePerUser()).to.equal(newMax);
    });
  });

  describe("🚨 Emergency Functions", function () {
    beforeEach(async function () {
      // Setup recovery admin using simplified method
      await teamsManager
        .connect(owner)
        .changeAdminRole(admin1.address, AdminRole.RECOVERY_ADMIN);

      // Add some tokens to the contract
      await votingToken.transfer(
        await teamsManager.getAddress(),
        ethers.parseEther("1000"),
      );
    });

    it("Should not allow RECOVERY_ADMIN to withdraw tokens when contract is not in emergency mode", async function () {
      const withdrawAmount = ethers.parseEther("500");
      const initialBalance = await votingToken.balanceOf(admin1.address);

      await expect(teamsManager
        .connect(admin1)
        .emergencyWithdraw(
          await votingToken.getAddress(),
          admin1.address,
          withdrawAmount,
        )).to.be.revertedWith("Emergency mode required");
    });

     it("Should trigger emergency mode successfully", async function () {
      await expect(teamsManager.connect(admin1).triggerEmergency())
        .to.emit(teamsManager, "EmergencyModeToggled")
        .withArgs(true, admin1.address);

      expect(await teamsManager.emergencyMode()).to.be.true;
    });

    it("Should allow RECOVERY_ADMIN to withdraw tokens only", async function () {
        await expect(teamsManager.connect(admin1).triggerEmergency())
        .to.emit(teamsManager, "EmergencyModeToggled")
        .withArgs(true, admin1.address);

      expect(await teamsManager.emergencyMode()).to.be.true;

      const withdrawAmount = ethers.parseEther("500");
      const initialBalance = await votingToken.balanceOf(admin1.address);

      await teamsManager
        .connect(admin1)
        .emergencyWithdraw(
          await votingToken.getAddress(),
          admin1.address,
          withdrawAmount,
        );

      const finalBalance = await votingToken.balanceOf(admin1.address);
      expect(finalBalance - initialBalance).to.equal(withdrawAmount);
    });

    it("Should prevent non-RECOVERY_ADMIN from emergency withdrawal", async function () {
      // Try Change admin2 to VOTE_ADMIN (lower than RECOVERY_ADMIN) so they can't do emergency withdrawal
      await expect(teamsManager
        .connect(owner)
        .changeAdminRole(admin2.address, AdminRole.VOTE_ADMIN));

        // turn on emergency
        await expect(teamsManager.connect(admin1).triggerEmergency())
        .to.emit(teamsManager, "EmergencyModeToggled")
        .withArgs(true, admin1.address);

      // Test with admin who doesn't have RECOVERY_ADMIN role
      await expect(
        teamsManager
          .connect(admin2)
          .emergencyWithdraw(
            await votingToken.getAddress(),
            admin2.address,
            ethers.parseEther("100"),
          ),
      ).to.be.revertedWith("Insufficient admin privileges");

       // test if nonAdmin can do emergency withdrawal
      await expect(
        teamsManager
          .connect(nonAdmin)
          .emergencyWithdraw(
            await votingToken.getAddress(),
            nonAdmin.address,
            ethers.parseEther("100"),
          ),
      ).to.be.revertedWith("Insufficient admin privileges");
    });
  });

  describe("🔧 System Management", function () {
    beforeEach(async function () {
      // Add a team first
      await teamsManager
        .connect(owner)
        .changeAdminRole(admin1.address, AdminRole.TEAM_MANAGER);
      await teamsManager
        .connect(admin1)
        .addTeam(
          "Team Alpha",
          await memeToken1.getAddress(),
          teamLeader1.address,
        );
    });

    it("Should allow SUPER_ADMIN to reset system", async function () {
      await expect(teamsManager.connect(owner).reset())
        .to.emit(teamsManager, "SystemReset")
        .withArgs(owner.address);

      expect(await teamsManager.readyToVote()).to.be.false;
      expect(await teamsManager.totalVotes()).to.equal(0);

      const teamNames = await teamsManager.getTeamNames();
      expect(teamNames).to.have.lengthOf(0);
    });

    it("Should prevent non-SUPER_ADMIN from resetting", async function () {
      // nonAdmin should get "Only super admin can perform this action" due to onlySuperAdmin modifier
      await expect(teamsManager.connect(nonAdmin).reset()).to.be.revertedWith(
        "Only super admin can perform this action",
      );
    });
  });

  describe("📊 View Functions", function () {
    beforeEach(async function () {
      // Setup and add teams
      await teamsManager
        .connect(owner)
        .changeAdminRole(admin1.address, AdminRole.TEAM_MANAGER);
      await teamsManager
        .connect(admin1)
        .addTeam(
          "Team Alpha",
          await memeToken1.getAddress(),
          teamLeader1.address,
        );
    });

    it("Should return correct team information", async function () {
      const teamInfo = await teamsManager.getTeamInfo("Team Alpha");

      expect(teamInfo.teamName).to.equal("Team Alpha");
      expect(teamInfo.memeTokenAddress).to.equal(await memeToken1.getAddress());
      expect(teamInfo.teamLeaderAddress).to.equal(teamLeader1.address);
      expect(teamInfo.score).to.equal(0);
      expect(teamInfo.isActive).to.be.true;
      expect(teamInfo.createdAt).to.be.gt(0);
    });

    it("Should return correct voting status", async function () {
      const votingStatus = await teamsManager.getVotingStatus();

      expect(votingStatus.isActive).to.be.false;
      expect(votingStatus.totalVotesCount).to.equal(0);
      expect(votingStatus.votingToken).to.equal(await votingToken.getAddress());
    });

    it("Should return team names", async function () {
      const teamNames = await teamsManager.getTeamNames();
      expect(teamNames).to.include("Team Alpha");
      expect(teamNames).to.have.lengthOf(1);
    });

    it("Should return user vote information", async function () {
      expect(
        await teamsManager.getUserVoteForTeam(voter1.address, "Team Alpha"),
      ).to.equal(0);
      expect(await teamsManager.getUserTotalVotes(voter1.address)).to.equal(0);
    });
  });

  describe("🔗 Integration with Administrable", function () {
    it("Should integrate role-based permissions correctly", async function () {
      // Test role checking
      expect(await teamsManager.hasRole(owner.address, AdminRole.SUPER_ADMIN))
        .to.be.true;
      expect(await teamsManager.hasRole(admin1.address, AdminRole.SUPER_ADMIN))
        .to.be.true;
      expect(
        await teamsManager.hasRole(nonAdmin.address, AdminRole.TEAM_MANAGER),
      ).to.be.false;
    });

    it("Should handle admin management", async function () {
      // Test adding admin
      await teamsManager
        .connect(owner)
        .addAdmin(nonAdmin.address, AdminRole.TEAM_MANAGER);
      expect(await teamsManager.isAdmin(nonAdmin.address)).to.be.true;
      expect(await teamsManager.getAdminRole(nonAdmin.address)).to.equal(
        AdminRole.TEAM_MANAGER,
      );
    });

    it("Should inherit emergency mode from Administrable", async function () {
      await teamsManager
        .connect(owner)
        .changeAdminRole(admin1.address, AdminRole.RECOVERY_ADMIN);

      await teamsManager.connect(admin1).triggerEmergency();
      expect(await teamsManager.emergencyMode()).to.be.true;

      // Normal operations should be blocked
      await expect(
        teamsManager
          .connect(owner)
          .addAdmin(nonAdmin.address, AdminRole.TEAM_MANAGER),
      ).to.be.revertedWith("Contract is in emergency mode");
    });
  });

  describe("🛡️ Security & Edge Cases", function () {
    it("Should handle voting time limits", async function () {
      await teamsManager
        .connect(owner)
        .changeAdminRole(admin1.address, AdminRole.TEAM_MANAGER);
      await teamsManager
        .connect(owner)
        .changeAdminRole(admin2.address, AdminRole.VOTE_ADMIN);

      await teamsManager
        .connect(admin1)
        .addTeam(
          "Team Alpha",
          await memeToken1.getAddress(),
          teamLeader1.address,
        );

      // Enable voting with time limit
      const duration = 3600; // 1 hour
      await teamsManager.connect(admin2).setReadyToVote(duration);

      // Fast forward past voting end time
      await time.increase(duration + 1);

      await expect(
        teamsManager
          .connect(voter1)
          .vote("Team Alpha", ethers.parseEther("100")),
      ).to.be.revertedWith("Voting has ended");
    });

    it("Should prevent operations during emergency", async function () {
      await teamsManager
        .connect(owner)
        .changeAdminRole(admin1.address, AdminRole.RECOVERY_ADMIN);
      await teamsManager.connect(admin1).triggerEmergency();

      await expect(
        teamsManager
          .connect(owner)
          .changeAdminRole(admin2.address, AdminRole.TEAM_MANAGER),
      ).to.be.revertedWith("Contract is in emergency mode");
    });

    it("Should handle invalid team operations", async function () {
      await expect(teamsManager.getTeamInfo("NonExistent Team")).to.not.be
        .reverted; // Should return empty struct

      await expect(teamsManager.getScore("NonExistent Team")).to.not.be
        .reverted; // Should return 0
    });
  });
});
