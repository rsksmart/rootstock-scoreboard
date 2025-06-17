const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("AdvancedGovernance - Multi-Sig & Staking Tests", function () {
  let advancedGovernance;
  let stakingToken;
  let owner, admin1, admin2, admin3, nonAdmin, newAdmin;

  // Admin role enum values
  const AdminRole = {
    NONE: 0,
    TEAM_MANAGER: 1,
    VOTE_ADMIN: 2,
    RECOVERY_ADMIN: 3,
    SUPER_ADMIN: 4,
  };

  const ActionType = {
    ADD_ADMIN: 0,
    REMOVE_ADMIN: 1,
    CHANGE_ROLE: 2,
    EMERGENCY_ACTION: 3,
    STAKE_SLASH: 4,
  };

  beforeEach(async function () {
    [owner, admin1, admin2, admin3, nonAdmin, newAdmin] =
      await ethers.getSigners();

    // Deploy mock ERC20 token for staking
    const MockToken = await ethers.getContractFactory("MockERC20");
    stakingToken = await MockToken.deploy(
      "Staking Token",
      "STAKE",
      ethers.parseEther("1000000"),
    );
    await stakingToken.waitForDeployment();

    // Deploy AdvancedGovernance contract
    const AdvancedGovernance =
      await ethers.getContractFactory("AdvancedGovernance");
    advancedGovernance = await AdvancedGovernance.deploy(
      [owner.address, admin1.address, admin2.address],
      await stakingToken.getAddress(),
      ethers.parseEther("1000"), // 1000 tokens minimum stake
    );
    await advancedGovernance.waitForDeployment();

    // Transfer staking tokens to users for testing
    await stakingToken.transfer(admin1.address, ethers.parseEther("5000"));
    await stakingToken.transfer(admin2.address, ethers.parseEther("5000"));
    await stakingToken.transfer(newAdmin.address, ethers.parseEther("5000"));
    await stakingToken.transfer(admin3.address, ethers.parseEther("5000"));
  });

  describe("🏗️ Contract Initialization", function () {
    it("Should initialize with correct admin count and confirmations", async function () {
      expect(await advancedGovernance.totalAdmins()).to.equal(3);
      expect(await advancedGovernance.requiredConfirmations()).to.equal(2); // 60% of 3 = 1.8, rounded to 2
    });

    it("Should set up role permissions correctly", async function () {
      // Check if super admin has permissions (should always return true)
      expect(
        await advancedGovernance.hasPermission(owner.address, "0x12345678"),
      ).to.be.true;
    });

    it("Should return all active admins", async function () {
      const allAdmins = await advancedGovernance.getAllAdmins();
      expect(allAdmins).to.have.lengthOf(3);
      expect(allAdmins).to.include(owner.address);
      expect(allAdmins).to.include(admin1.address);
      expect(allAdmins).to.include(admin2.address);
    });

    it("Should initialize staking parameters correctly", async function () {
      expect(await advancedGovernance.minimumStake()).to.equal(
        ethers.parseEther("1000"),
      );
      expect(await advancedGovernance.slashPercentage()).to.equal(10);
      expect(await advancedGovernance.totalStaked()).to.equal(0);
      expect(await advancedGovernance.rewardPool()).to.equal(0);
    });
  });

  describe("🗳️ Multi-Signature Admin Operations", function () {
    describe("Adding New Admin", function () {
      it("Should allow super admin to propose adding new admin", async function () {
        await expect(
          advancedGovernance
            .connect(owner)
            .proposeAddAdmin(
              newAdmin.address,
              AdminRole.TEAM_MANAGER,
              "Adding new team manager",
            ),
        )
          .to.emit(advancedGovernance, "ActionProposed")
          .withArgs(1, owner.address, ActionType.ADD_ADMIN);

        const action = await advancedGovernance.getPendingAction(1);
        expect(action.target).to.equal(newAdmin.address);
        expect(action.newRole).to.equal(AdminRole.TEAM_MANAGER);
        expect(action.confirmations).to.equal(1); // Proposer auto-confirms
      });

      it("Should prevent non-super-admin from proposing admin addition", async function () {
        // First change admin1 to a lower role
        await advancedGovernance
          .connect(owner)
          .proposeRoleChange(admin1.address, AdminRole.TEAM_MANAGER, "test");
        await advancedGovernance.connect(admin2).confirmAction(1);
        await advancedGovernance.connect(owner).executeAction(1);

        // Now admin1 should not be able to propose admin addition
        await expect(
          advancedGovernance
            .connect(admin1)
            .proposeAddAdmin(
              newAdmin.address,
              AdminRole.VOTE_ADMIN,
              "Should fail",
            ),
        ).to.be.revertedWith("Insufficient admin privileges");
      });

      it("Should complete multi-sig workflow to add new admin", async function () {
        // Step 1: Propose
        await advancedGovernance
          .connect(owner)
          .proposeAddAdmin(
            newAdmin.address,
            AdminRole.TEAM_MANAGER,
            "Adding team manager",
          );

        // Step 2: Second admin confirms
        await expect(advancedGovernance.connect(admin1).confirmAction(1))
          .to.emit(advancedGovernance, "ActionConfirmed")
          .withArgs(1, admin1.address);

        // Step 3: Execute action
        await expect(advancedGovernance.connect(admin2).executeAction(1))
          .to.emit(advancedGovernance, "ActionExecuted")
          .and.to.emit(advancedGovernance, "AdminAdded")
          .withArgs(newAdmin.address, AdminRole.TEAM_MANAGER, 0);

        // Verify new admin was added
        expect(await advancedGovernance.isAdmin(newAdmin.address)).to.be.true;
        expect(
          await advancedGovernance.getAdminRole(newAdmin.address),
        ).to.equal(AdminRole.TEAM_MANAGER);
        expect(await advancedGovernance.totalAdmins()).to.equal(4);
      });

      it("Should prevent double confirmation", async function () {
        await advancedGovernance
          .connect(owner)
          .proposeAddAdmin(newAdmin.address, AdminRole.TEAM_MANAGER, "test");
        await advancedGovernance.connect(admin1).confirmAction(1);

        await expect(
          advancedGovernance.connect(admin1).confirmAction(1),
        ).to.be.revertedWith("Already confirmed");
      });

      it("Should prevent execution without enough confirmations", async function () {
        await advancedGovernance
          .connect(owner)
          .proposeAddAdmin(newAdmin.address, AdminRole.TEAM_MANAGER, "test");

        // Only 1 confirmation (from proposer), need 2
        await expect(
          advancedGovernance.connect(admin1).executeAction(1),
        ).to.be.revertedWith("Insufficient confirmations");
      });
    });

    describe("Removing Admin", function () {
      beforeEach(async function () {
        // Add a 4th admin first so we can test removal
        await advancedGovernance
          .connect(owner)
          .proposeAddAdmin(admin3.address, AdminRole.SUPER_ADMIN, "test");
        await advancedGovernance.connect(admin1).confirmAction(1);
        await advancedGovernance.connect(owner).executeAction(1);
        // Now we have 4 admins, can test removal
      });

      it("Should allow proposing admin removal", async function () {
        await expect(
          advancedGovernance
            .connect(owner)
            .proposeRemoveAdmin(admin1.address, "Inactive admin"),
        )
          .to.emit(advancedGovernance, "ActionProposed")
          .withArgs(2, owner.address, ActionType.REMOVE_ADMIN);
      });

      it("Should prevent removal below minimum admins", async function () {
        // Remove admin1 (4 -> 3)
        await advancedGovernance
          .connect(owner)
          .proposeRemoveAdmin(admin1.address, "test");
        await advancedGovernance.connect(admin2).confirmAction(2);
        await advancedGovernance.connect(owner).executeAction(2);

        // Remove admin2 (3 -> 2) - should fail
        await expect(
          advancedGovernance
            .connect(owner)
            .proposeRemoveAdmin(admin2.address, "test"),
        ).to.be.revertedWith("Cannot remove admin: minimum 3 required");
      });

      it("Should complete admin removal workflow", async function () {
        await advancedGovernance
          .connect(owner)
          .proposeRemoveAdmin(admin1.address, "test");
        await advancedGovernance.connect(admin2).confirmAction(2);

        await expect(
          advancedGovernance.connect(owner).executeAction(2),
        ).to.emit(advancedGovernance, "AdminRemoved");

        expect(await advancedGovernance.isAdmin(admin1.address)).to.be.false;
        expect(await advancedGovernance.totalAdmins()).to.equal(3);
      });
    });

    describe("Role Changes", function () {
      it("Should allow changing admin roles", async function () {
        await advancedGovernance
          .connect(owner)
          .proposeRoleChange(
            admin1.address,
            AdminRole.VOTE_ADMIN,
            "Changing to vote admin",
          );
        await advancedGovernance.connect(admin2).confirmAction(1);

        await expect(advancedGovernance.connect(owner).executeAction(1))
          .to.emit(advancedGovernance, "AdminRoleChanged")
          .withArgs(
            admin1.address,
            AdminRole.SUPER_ADMIN,
            AdminRole.VOTE_ADMIN,
          );

        expect(await advancedGovernance.getAdminRole(admin1.address)).to.equal(
          AdminRole.VOTE_ADMIN,
        );
      });

      it("Should prevent changing to same role", async function () {
        await expect(
          advancedGovernance
            .connect(owner)
            .proposeRoleChange(
              admin1.address,
              AdminRole.SUPER_ADMIN,
              "Same role",
            ),
        ).to.be.revertedWith("Same role");
      });
    });

    describe("Action Management", function () {
      it("Should allow cancelling pending actions", async function () {
        await advancedGovernance
          .connect(owner)
          .proposeAddAdmin(newAdmin.address, AdminRole.TEAM_MANAGER, "test");

        await expect(advancedGovernance.connect(owner).cancelAction(1)).to.emit(
          advancedGovernance,
          "ActionCancelled",
        );

        const action = await advancedGovernance.getPendingAction(1);
        expect(action.cancelled).to.be.true;
      });

      it("Should handle action expiration", async function () {
        await advancedGovernance
          .connect(owner)
          .proposeAddAdmin(newAdmin.address, AdminRole.TEAM_MANAGER, "test");

        // Fast forward past deadline (7 days)
        await time.increase(7 * 24 * 3600 + 1);

        await expect(
          advancedGovernance.connect(admin1).confirmAction(1),
        ).to.be.revertedWith("Action expired");
      });

      it("Should check if action can be executed", async function () {
        await advancedGovernance
          .connect(owner)
          .proposeAddAdmin(newAdmin.address, AdminRole.TEAM_MANAGER, "test");

        // Should not be executable with only 1 confirmation
        expect(await advancedGovernance.canExecuteAction(1)).to.be.false;

        // Add another confirmation
        await advancedGovernance.connect(admin1).confirmAction(1);

        // Should now be executable
        expect(await advancedGovernance.canExecuteAction(1)).to.be.true;
      });
    });
  });

  describe("⏰ Time-Locked Operations", function () {
    it("Should allow scheduling time-locked admin addition", async function () {
      const delay = 3600; // 1 hour

      await expect(
        advancedGovernance
          .connect(owner)
          .scheduleTimeLockAddAdmin(
            newAdmin.address,
            AdminRole.VOTE_ADMIN,
            delay,
          ),
      ).to.emit(advancedGovernance, "TimeLockScheduled");

      const timeLock = await advancedGovernance.getTimeLock(1);
      expect(timeLock.action.target).to.equal(newAdmin.address);
      expect(timeLock.action.newRole).to.equal(AdminRole.VOTE_ADMIN);
    });

    it("Should prevent execution before unlock time", async function () {
      const delay = 3600;
      await advancedGovernance
        .connect(owner)
        .scheduleTimeLockAddAdmin(
          newAdmin.address,
          AdminRole.VOTE_ADMIN,
          delay,
        );

      await expect(
        advancedGovernance.connect(admin1).executeTimeLock(1),
      ).to.be.revertedWith("Time lock not yet unlocked");
    });

    it("Should allow execution after unlock time", async function () {
      const delay = 3600;
      await advancedGovernance
        .connect(owner)
        .scheduleTimeLockAddAdmin(
          newAdmin.address,
          AdminRole.VOTE_ADMIN,
          delay,
        );

      // Fast forward time
      await time.increase(delay + 1);

      await expect(advancedGovernance.connect(admin1).executeTimeLock(1))
        .to.emit(advancedGovernance, "TimeLockExecuted")
        .and.to.emit(advancedGovernance, "AdminAdded");

      expect(await advancedGovernance.isAdmin(newAdmin.address)).to.be.true;
    });

    it("Should allow cancelling time locks", async function () {
      const delay = 3600;
      await advancedGovernance
        .connect(owner)
        .scheduleTimeLockAddAdmin(
          newAdmin.address,
          AdminRole.VOTE_ADMIN,
          delay,
        );

      await advancedGovernance.connect(owner).cancelTimeLock(1);

      const timeLock = await advancedGovernance.getTimeLock(1);
      expect(timeLock.cancelled).to.be.true;
    });

    it("Should require minimum delay", async function () {
      await expect(
        advancedGovernance.connect(owner).scheduleTimeLockAddAdmin(
          newAdmin.address,
          AdminRole.VOTE_ADMIN,
          1800, // 30 minutes, less than 1 hour minimum
        ),
      ).to.be.revertedWith("Minimum 1 hour delay required");
    });
  });

  describe("💰 Staking Mechanism", function () {
    beforeEach(async function () {
      // Approve staking tokens for all users
      await stakingToken
        .connect(admin1)
        .approve(
          await advancedGovernance.getAddress(),
          ethers.parseEther("3000"),
        );
      await stakingToken
        .connect(admin2)
        .approve(
          await advancedGovernance.getAddress(),
          ethers.parseEther("3000"),
        );
      await stakingToken
        .connect(newAdmin)
        .approve(
          await advancedGovernance.getAddress(),
          ethers.parseEther("3000"),
        );
    });

    describe("Staking Tokens", function () {
      it("Should allow staking tokens", async function () {
        const stakeAmount = ethers.parseEther("1500");

        await expect(
          advancedGovernance.connect(admin1).stakeForAdmin(stakeAmount),
        )
          .to.emit(advancedGovernance, "AdminStaked")
          .withArgs(admin1.address, stakeAmount);

        const adminInfo = await advancedGovernance.getAdminInfo(admin1.address);
        expect(adminInfo.stakedAmount).to.equal(stakeAmount);
        expect(await advancedGovernance.totalStaked()).to.equal(stakeAmount);
      });

      it("Should require minimum stake amount", async function () {
        const belowMinimum = ethers.parseEther("500");

        await expect(
          advancedGovernance.connect(admin1).stakeForAdmin(belowMinimum),
        ).to.be.revertedWith("Insufficient stake amount");
      });

      it("Should accumulate multiple stakes", async function () {
        await advancedGovernance
          .connect(admin1)
          .stakeForAdmin(ethers.parseEther("1000"));
        await advancedGovernance
          .connect(admin1)
          .stakeForAdmin(ethers.parseEther("500"));

        const adminInfo = await advancedGovernance.getAdminInfo(admin1.address);
        expect(adminInfo.stakedAmount).to.equal(ethers.parseEther("1500"));
      });
    });

    describe("Admin Slashing", function () {
      beforeEach(async function () {
        // Stake tokens first
        await advancedGovernance
          .connect(admin1)
          .stakeForAdmin(ethers.parseEther("2000"));
        await advancedGovernance
          .connect(admin2)
          .stakeForAdmin(ethers.parseEther("1500"));
      });

      it("Should allow proposing admin slashing", async function () {
        await expect(
          advancedGovernance
            .connect(owner)
            .proposeSlashAdmin(admin1.address, "Misconduct detected"),
        ).to.emit(advancedGovernance, "ActionProposed");

        const action = await advancedGovernance.getPendingAction(1);
        expect(action.actionType).to.equal(ActionType.STAKE_SLASH);
        expect(action.target).to.equal(admin1.address);
      });

      it("Should execute slashing after confirmations", async function () {
        const originalStake = ethers.parseEther("2000");
        const expectedSlash = (originalStake * BigInt(10)) / BigInt(100); // 10%

        await advancedGovernance
          .connect(owner)
          .proposeSlashAdmin(admin1.address, "Misconduct");
        await advancedGovernance.connect(admin2).confirmAction(1);

        await expect(advancedGovernance.connect(owner).executeSlash(1))
          .to.emit(advancedGovernance, "AdminSlashed")
          .withArgs(admin1.address, expectedSlash, "Misconduct");

        const adminInfo = await advancedGovernance.getAdminInfo(admin1.address);
        expect(adminInfo.stakedAmount).to.equal(originalStake - expectedSlash);
        expect(adminInfo.slashCount).to.equal(1);
        expect(await advancedGovernance.rewardPool()).to.equal(expectedSlash);
      });

      it("Should remove admin after 3 slashes", async function () {
        // Execute 3 slashes
        for (let i = 0; i < 3; i++) {
          await advancedGovernance
            .connect(owner)
            .proposeSlashAdmin(admin1.address, `Misconduct ${i + 1}`);
          const actionId = i + 1;
          await advancedGovernance.connect(admin2).confirmAction(actionId);
          await advancedGovernance.connect(owner).executeSlash(actionId);
        }

        const adminInfo = await advancedGovernance.getAdminInfo(admin1.address);
        expect(adminInfo.isActive).to.be.false;
      });

      it("Should prevent slashing admin with no stake", async function () {
        await expect(
          advancedGovernance
            .connect(owner)
            .proposeSlashAdmin(owner.address, "No stake"),
        ).to.be.revertedWith("No stake to slash");
      });
    });

    describe("Reward Distribution", function () {
      beforeEach(async function () {
        // Setup: stake tokens and create reward pool through slashing
        await advancedGovernance
          .connect(admin1)
          .stakeForAdmin(ethers.parseEther("1500"));
        await advancedGovernance
          .connect(admin2)
          .stakeForAdmin(ethers.parseEther("1500"));

        // Slash admin1 to create rewards
        await advancedGovernance
          .connect(owner)
          .proposeSlashAdmin(admin1.address, "test");
        await advancedGovernance.connect(admin2).confirmAction(1);
        await advancedGovernance.connect(owner).executeSlash(1);
      });

      it("Should allow claiming rewards", async function () {
        const initialBalance = await stakingToken.balanceOf(admin2.address);

        await expect(advancedGovernance.connect(admin2).claimRewards()).to.emit(
          advancedGovernance,
          "RewardsClaimed",
        );

        const finalBalance = await stakingToken.balanceOf(admin2.address);
        expect(finalBalance).to.be.gt(initialBalance);
      });

      it("Should prevent claiming rewards without stake", async function () {
        await expect(
          advancedGovernance.connect(owner).claimRewards(),
        ).to.be.revertedWith("No stake to claim rewards for");
      });
    });

    describe("Stake Withdrawal", function () {
      it("Should allow non-admins to withdraw stake", async function () {
        // Add 4th admin first
        await advancedGovernance
          .connect(owner)
          .proposeAddAdmin(admin3.address, AdminRole.SUPER_ADMIN, "test");
        await advancedGovernance.connect(admin1).confirmAction(1);
        await advancedGovernance.connect(owner).executeAction(1);

        // Stake as admin first
        await advancedGovernance
          .connect(admin1)
          .stakeForAdmin(ethers.parseEther("1500"));

        // Remove admin status
        await advancedGovernance
          .connect(owner)
          .proposeRemoveAdmin(admin1.address, "test");
        await advancedGovernance.connect(admin2).confirmAction(2);
        await advancedGovernance.connect(owner).executeAction(2);

        // Should now be able to withdraw stake
        const withdrawAmount = ethers.parseEther("500");
        await advancedGovernance.connect(admin1).withdrawStake(withdrawAmount);

        const adminInfo = await advancedGovernance.getAdminInfo(admin1.address);
        expect(adminInfo.stakedAmount).to.equal(ethers.parseEther("1000"));
      });

      it("Should prevent active admins from withdrawing stake", async function () {
        await advancedGovernance
          .connect(admin1)
          .stakeForAdmin(ethers.parseEther("1500"));

        await expect(
          advancedGovernance
            .connect(admin1)
            .withdrawStake(ethers.parseEther("500")),
        ).to.be.revertedWith("Active admins cannot withdraw stake");
      });

      it("Should allow withdrawal during emergency", async function () {
        await advancedGovernance
          .connect(admin1)
          .stakeForAdmin(ethers.parseEther("1500"));

        // Make admin2 a recovery admin so they can trigger emergency
        await advancedGovernance
          .connect(owner)
          .proposeRoleChange(admin2.address, AdminRole.RECOVERY_ADMIN, "test");
        await advancedGovernance.connect(admin1).confirmAction(1);
        await advancedGovernance.connect(owner).executeAction(1);

        await advancedGovernance.connect(admin2).triggerEmergency();

        // Should be able to withdraw during emergency
        await advancedGovernance
          .connect(admin1)
          .withdrawStake(ethers.parseEther("500"));
      });
    });
  });

  describe("🚨 Emergency Functions", function () {
    it("Should allow recovery admin to trigger emergency", async function () {
      // First make admin1 a recovery admin
      await advancedGovernance
        .connect(owner)
        .proposeRoleChange(admin1.address, AdminRole.RECOVERY_ADMIN, "test");
      await advancedGovernance.connect(admin2).confirmAction(1);
      await advancedGovernance.connect(owner).executeAction(1);

      await expect(advancedGovernance.connect(admin1).triggerEmergency())
        .to.emit(advancedGovernance, "EmergencyModeToggled")
        .withArgs(true, admin1.address);

      expect(await advancedGovernance.emergencyMode()).to.be.true;
      expect(await advancedGovernance.emergencyTriggeredBy()).to.equal(
        admin1.address,
      );
    });

    it("Should allow super admin to resolve emergency", async function () {
      // First make admin1 a recovery admin so they can trigger emergency
      await advancedGovernance
        .connect(owner)
        .proposeRoleChange(admin1.address, AdminRole.RECOVERY_ADMIN, "test");
      await advancedGovernance.connect(admin2).confirmAction(1);
      await advancedGovernance.connect(owner).executeAction(1);

      // Now admin1 can trigger emergency
      await advancedGovernance.connect(admin1).triggerEmergency();

      // Owner (SUPER_ADMIN) should be able to resolve emergency
      await expect(advancedGovernance.connect(owner).resolveEmergency())
        .to.emit(advancedGovernance, "EmergencyModeToggled")
        .withArgs(false, owner.address);

      expect(await advancedGovernance.emergencyMode()).to.be.false;
    });

    it("Should allow emergency admin addition during emergency", async function () {
      // First make admin1 a recovery admin so they can trigger emergency
      await advancedGovernance
        .connect(owner)
        .proposeRoleChange(admin1.address, AdminRole.RECOVERY_ADMIN, "test");
      await advancedGovernance.connect(admin2).confirmAction(1);
      await advancedGovernance.connect(owner).executeAction(1);

      // Now admin1 can trigger emergency and add admins during emergency
      await advancedGovernance.connect(admin1).triggerEmergency();

      await expect(
        advancedGovernance
          .connect(admin1)
          .emergencyAddAdmin(newAdmin.address, AdminRole.RECOVERY_ADMIN),
      ).to.emit(advancedGovernance, "AdminAdded");

      expect(await advancedGovernance.isAdmin(newAdmin.address)).to.be.true;
    });

    it("Should prevent normal operations during emergency", async function () {
      // First make admin1 a recovery admin so they can trigger emergency
      await advancedGovernance
        .connect(owner)
        .proposeRoleChange(admin1.address, AdminRole.RECOVERY_ADMIN, "test");
      await advancedGovernance.connect(admin2).confirmAction(1);
      await advancedGovernance.connect(owner).executeAction(1);

      // Now trigger emergency
      await advancedGovernance.connect(admin1).triggerEmergency();

      // Normal operations should be blocked during emergency
      await expect(
        advancedGovernance
          .connect(owner)
          .proposeAddAdmin(newAdmin.address, AdminRole.TEAM_MANAGER, "test"),
      ).to.be.revertedWith("Contract is in emergency mode");
    });

    it("Should prevent non-recovery-admin from triggering emergency", async function () {
      // admin1 is SUPER_ADMIN but not RECOVERY_ADMIN, so should fail
      await expect(
        advancedGovernance.connect(admin1).triggerEmergency(),
      ).to.be.revertedWith("Only recovery admin can trigger emergency");
    });
  });

  describe("📊 View Functions & Utilities", function () {
    it("Should return pending actions count", async function () {
      expect(await advancedGovernance.getPendingActionsCount()).to.equal(0);

      await advancedGovernance
        .connect(owner)
        .proposeAddAdmin(newAdmin.address, AdminRole.TEAM_MANAGER, "test");
      expect(await advancedGovernance.getPendingActionsCount()).to.equal(1);

      await advancedGovernance
        .connect(owner)
        .proposeAddAdmin(admin3.address, AdminRole.VOTE_ADMIN, "test");
      expect(await advancedGovernance.getPendingActionsCount()).to.equal(2);
    });

    it("Should update required confirmations when admin count changes", async function () {
      // Start with 3 admins, requiredConfirmations should be 2 (60% of 3 = 1.8, rounded to 2)
      expect(await advancedGovernance.requiredConfirmations()).to.equal(2);

      // Add new admin (increases total to 4)
      await advancedGovernance
        .connect(owner)
        .proposeAddAdmin(newAdmin.address, AdminRole.SUPER_ADMIN, "test");
      await advancedGovernance.connect(admin1).confirmAction(1);
      await advancedGovernance.connect(owner).executeAction(1);

      // Required confirmations should update (60% of 4 = 2.4, rounded to 2, but minimum is 2)
      expect(await advancedGovernance.requiredConfirmations()).to.equal(2);

      // Add another admin (increases total to 5)
      await advancedGovernance
        .connect(owner)
        .proposeAddAdmin(admin3.address, AdminRole.SUPER_ADMIN, "test");
      await advancedGovernance.connect(admin1).confirmAction(2);
      await advancedGovernance.connect(owner).executeAction(2);

      // Required confirmations should update (60% of 5 = 3)
      expect(await advancedGovernance.requiredConfirmations()).to.equal(3);
    });

    it("Should return complete admin information", async function () {
      const adminInfo = await advancedGovernance.getAdminInfo(owner.address);
      expect(adminInfo.role).to.equal(AdminRole.SUPER_ADMIN);
      expect(adminInfo.isActive).to.be.true;
      expect(adminInfo.stakedAmount).to.equal(0);
      expect(adminInfo.slashCount).to.equal(0);
      expect(adminInfo.joinTimestamp).to.be.gt(0);
    });

    it("Should return correct permission checks", async function () {
      // Super admin should have all permissions
      expect(
        await advancedGovernance.hasPermission(owner.address, "0x12345678"),
      ).to.be.true;

      // Test specific role permissions after changing role
      await advancedGovernance
        .connect(owner)
        .proposeRoleChange(admin1.address, AdminRole.TEAM_MANAGER, "test");
      await advancedGovernance.connect(admin2).confirmAction(1);
      await advancedGovernance.connect(owner).executeAction(1);

      // Team manager should have limited permissions
      const teamManagerSelector = ethers
        .id("addTeam(string,address,address)")
        .slice(0, 10);
      expect(
        await advancedGovernance.hasPermission(
          admin1.address,
          teamManagerSelector,
        ),
      ).to.be.true;
    });
  });

  describe("🛡️ Security & Edge Cases", function () {
    it("Should prevent invalid action IDs", async function () {
      await expect(
        advancedGovernance.connect(admin1).confirmAction(999),
      ).to.be.revertedWith("Invalid action ID");

      await expect(
        advancedGovernance.connect(admin1).executeAction(0),
      ).to.be.revertedWith("Invalid action ID");
    });

    it("Should prevent executing cancelled actions", async function () {
      await advancedGovernance
        .connect(owner)
        .proposeAddAdmin(newAdmin.address, AdminRole.TEAM_MANAGER, "test");
      await advancedGovernance.connect(admin1).confirmAction(1);
      await advancedGovernance.connect(owner).cancelAction(1);

      await expect(
        advancedGovernance.connect(admin2).executeAction(1),
      ).to.be.revertedWith("Action cancelled");
    });

    it("Should handle zero address validations", async function () {
      await expect(
        advancedGovernance
          .connect(owner)
          .proposeAddAdmin(ethers.ZeroAddress, AdminRole.TEAM_MANAGER, "test"),
      ).to.be.revertedWith("Invalid admin address");
    });

    it("Should prevent adding existing admins", async function () {
      await expect(
        advancedGovernance
          .connect(owner)
          .proposeAddAdmin(admin1.address, AdminRole.TEAM_MANAGER, "test"),
      ).to.be.revertedWith("Already an admin");
    });

    it("Should handle minimum confirmations correctly", async function () {
      // With 3 admins, minimum should be 2
      expect(await advancedGovernance.requiredConfirmations()).to.equal(2);

      // Even if calculated value would be less than 2, it should stay at 2
      // This is already handled in the contract logic
    });

    it("Should require minimum initial admins", async function () {
      const AdvancedGovernance =
        await ethers.getContractFactory("AdvancedGovernance");

      await expect(
        AdvancedGovernance.deploy(
          [owner.address, admin1.address], // Only 2 admins, need 3
          await stakingToken.getAddress(),
          ethers.parseEther("1000"),
        ),
      ).to.be.revertedWith("At least 3 initial admins required");
    });

    it("Should handle staking token validation", async function () {
      const AdvancedGovernance =
        await ethers.getContractFactory("AdvancedGovernance");

      await expect(
        AdvancedGovernance.deploy(
          [owner.address, admin1.address, admin2.address],
          ethers.ZeroAddress, // Invalid token address
          ethers.parseEther("1000"),
        ),
      ).to.be.revertedWith("Invalid staking token");
    });
  });
});
