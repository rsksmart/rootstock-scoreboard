const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Administrable - Basic Admin Management Tests", function () {
  let administrable;
  let owner, admin1, admin2, nonAdmin, newAdmin;

  // Admin role enum values
  const AdminRole = {
    NONE: 0,
    TEAM_MANAGER: 1,
    VOTE_ADMIN: 2,
    RECOVERY_ADMIN: 3,
    SUPER_ADMIN: 4,
  };

  beforeEach(async function () {
    [owner, admin1, admin2, nonAdmin, newAdmin] = await ethers.getSigners();

    // Deploy simplified Administrable contract
    const Administrable = await ethers.getContractFactory("Administrable");
    administrable = await Administrable.deploy([
      owner.address,
      admin1.address,
      admin2.address,
    ]);
    await administrable.waitForDeployment();
  });

  describe("🏗️ Contract Initialization", function () {
    it("Should initialize with correct admin count", async function () {
      expect(await administrable.totalAdmins()).to.equal(3);
    });

    it("Should set initial admins as super admins", async function () {
      expect(await administrable.getAdminRole(owner.address)).to.equal(
        AdminRole.SUPER_ADMIN,
      );
      expect(await administrable.getAdminRole(admin1.address)).to.equal(
        AdminRole.SUPER_ADMIN,
      );
      expect(await administrable.getAdminRole(admin2.address)).to.equal(
        AdminRole.SUPER_ADMIN,
      );
    });

    it("Should mark initial admins as active", async function () {
      expect(await administrable.isAdmin(owner.address)).to.be.true;
      expect(await administrable.isAdmin(admin1.address)).to.be.true;
      expect(await administrable.isAdmin(admin2.address)).to.be.true;
      expect(await administrable.isAdmin(nonAdmin.address)).to.be.false;
    });

    it("Should return all active admins", async function () {
      const allAdmins = await administrable.getAllAdmins();
      expect(allAdmins).to.have.lengthOf(3);
      expect(allAdmins).to.include(owner.address);
      expect(allAdmins).to.include(admin1.address);
      expect(allAdmins).to.include(admin2.address);
    });
  });

  describe("👤 Basic Admin Management", function () {
    describe("Adding Admins", function () {
      it("Should allow super admin to add new admin", async function () {
        await expect(
          administrable
            .connect(owner)
            .addAdmin(newAdmin.address, AdminRole.TEAM_MANAGER),
        )
          .to.emit(administrable, "AdminAdded")
          .withArgs(newAdmin.address, AdminRole.TEAM_MANAGER);

        expect(await administrable.isAdmin(newAdmin.address)).to.be.true;
        expect(await administrable.getAdminRole(newAdmin.address)).to.equal(
          AdminRole.TEAM_MANAGER,
        );
        expect(await administrable.totalAdmins()).to.equal(4);
      });

      it("Should prevent non-super-admin from adding admins", async function () {
        // First change admin1 to a lower role
        await administrable
          .connect(owner)
          .changeAdminRole(admin1.address, AdminRole.TEAM_MANAGER);

        // Now admin1 should not be able to add admins
        await expect(
          administrable
            .connect(admin1)
            .addAdmin(newAdmin.address, AdminRole.VOTE_ADMIN),
        ).to.be.revertedWith("Only super admin can perform this action");
      });

      it("Should prevent adding invalid addresses", async function () {
        await expect(
          administrable
            .connect(owner)
            .addAdmin(ethers.ZeroAddress, AdminRole.TEAM_MANAGER),
        ).to.be.revertedWith("Invalid admin address");
      });

      it("Should prevent adding existing admins", async function () {
        await expect(
          administrable
            .connect(owner)
            .addAdmin(admin1.address, AdminRole.TEAM_MANAGER),
        ).to.be.revertedWith("Already an admin");
      });

      it("Should prevent adding admin with NONE role", async function () {
        await expect(
          administrable
            .connect(owner)
            .addAdmin(newAdmin.address, AdminRole.NONE),
        ).to.be.revertedWith("Invalid role");
      });

      it("Should prevent operations during emergency", async function () {
        // First make admin1 a recovery admin so they can trigger emergency
        await administrable
          .connect(owner)
          .changeAdminRole(admin1.address, AdminRole.RECOVERY_ADMIN);
        await administrable.connect(admin1).triggerEmergency();

        await expect(
          administrable
            .connect(owner)
            .addAdmin(newAdmin.address, AdminRole.TEAM_MANAGER),
        ).to.be.revertedWith("Contract is in emergency mode");
      });
    });

    describe("Removing Admins", function () {
      beforeEach(async function () {
        // Add a 4th admin so we can test removal without going below minimum
        await administrable
          .connect(owner)
          .addAdmin(newAdmin.address, AdminRole.TEAM_MANAGER);
      });

      it("Should allow super admin to remove admin", async function () {
        await expect(administrable.connect(owner).removeAdmin(newAdmin.address))
          .to.emit(administrable, "AdminRemoved")
          .withArgs(newAdmin.address, AdminRole.TEAM_MANAGER);

        expect(await administrable.isAdmin(newAdmin.address)).to.be.false;
        expect(await administrable.getAdminRole(newAdmin.address)).to.equal(
          AdminRole.NONE,
        );
        expect(await administrable.totalAdmins()).to.equal(3);
      });

      it("Should prevent removing last admin", async function () {
        // We start with 4 admins: owner, admin1, admin2, newAdmin
        // Remove until we have only 1 admin left
        await administrable.connect(owner).removeAdmin(newAdmin.address); // 4 -> 3
        await administrable.connect(owner).removeAdmin(admin1.address); // 3 -> 2
        await administrable.connect(owner).removeAdmin(admin2.address); // 2 -> 1

        // Now try to remove the last admin - should fail
        await expect(
          administrable.connect(owner).removeAdmin(owner.address),
        ).to.be.revertedWith("Cannot remove last admin");

        // Verify we still have 1 admin
        expect(await administrable.totalAdmins()).to.equal(1);
      });

      it("Should prevent non-super-admin from removing admins", async function () {
        await administrable
          .connect(owner)
          .changeAdminRole(admin1.address, AdminRole.TEAM_MANAGER);

        await expect(
          administrable.connect(admin1).removeAdmin(newAdmin.address),
        ).to.be.revertedWith("Only super admin can perform this action");
      });

      it("Should prevent removing non-admin", async function () {
        await expect(
          administrable.connect(owner).removeAdmin(nonAdmin.address),
        ).to.be.revertedWith("Not an admin");
      });

      it("Should update admin list correctly after removal", async function () {
        const adminsBefore = await administrable.getAllAdmins();
        expect(adminsBefore).to.have.lengthOf(4);

        await administrable.connect(owner).removeAdmin(newAdmin.address);

        const adminsAfter = await administrable.getAllAdmins();
        expect(adminsAfter).to.have.lengthOf(3);
        expect(adminsAfter).to.not.include(newAdmin.address);
      });
    });

    describe("Role Changes", function () {
      it("Should allow super admin to change roles", async function () {
        await expect(
          administrable
            .connect(owner)
            .changeAdminRole(admin1.address, AdminRole.VOTE_ADMIN),
        )
          .to.emit(administrable, "AdminRoleChanged")
          .withArgs(
            admin1.address,
            AdminRole.SUPER_ADMIN,
            AdminRole.VOTE_ADMIN,
          );

        expect(await administrable.getAdminRole(admin1.address)).to.equal(
          AdminRole.VOTE_ADMIN,
        );
      });

      it("Should prevent changing to same role", async function () {
        await expect(
          administrable
            .connect(owner)
            .changeAdminRole(admin1.address, AdminRole.SUPER_ADMIN),
        ).to.be.revertedWith("Same role");
      });

      it("Should prevent changing to NONE role", async function () {
        await expect(
          administrable
            .connect(owner)
            .changeAdminRole(admin1.address, AdminRole.NONE),
        ).to.be.revertedWith("Invalid role");
      });

      it("Should prevent changing role of non-admin", async function () {
        await expect(
          administrable
            .connect(owner)
            .changeAdminRole(nonAdmin.address, AdminRole.TEAM_MANAGER),
        ).to.be.revertedWith("Not an admin");
      });

      it("Should prevent non-super-admin from changing roles", async function () {
        await administrable
          .connect(owner)
          .changeAdminRole(admin1.address, AdminRole.TEAM_MANAGER);

        await expect(
          administrable
            .connect(admin1)
            .changeAdminRole(admin2.address, AdminRole.VOTE_ADMIN),
        ).to.be.revertedWith("Only super admin can perform this action");
      });
    });
  });

  describe("🚨 Emergency Functions", function () {
    beforeEach(async function () {
      // Make admin1 a recovery admin so they can trigger emergency
      await administrable
        .connect(owner)
        .changeAdminRole(admin1.address, AdminRole.RECOVERY_ADMIN);
    });

    it("Should allow recovery admin to trigger emergency", async function () {
      await expect(administrable.connect(admin1).triggerEmergency())
        .to.emit(administrable, "EmergencyModeToggled")
        .withArgs(true, admin1.address);

      expect(await administrable.emergencyMode()).to.be.true;
      expect(await administrable.emergencyTriggeredBy()).to.equal(
        admin1.address,
      );
      expect(await administrable.emergencyStartTime()).to.be.gt(0);
    });

    it("Should prevent non-recovery-admin from triggering emergency", async function () {
      await expect(
        administrable.connect(admin2).triggerEmergency(),
      ).to.be.revertedWith("Only recovery admin can trigger emergency");

      await expect(
        administrable.connect(nonAdmin).triggerEmergency(),
      ).to.be.revertedWith("Only recovery admin can trigger emergency");
    });

    it("Should allow super admin to resolve emergency", async function () {
      await administrable.connect(admin1).triggerEmergency();

      await expect(administrable.connect(owner).resolveEmergency())
        .to.emit(administrable, "EmergencyModeToggled")
        .withArgs(false, owner.address);

      expect(await administrable.emergencyMode()).to.be.false;
      expect(await administrable.emergencyTriggeredBy()).to.equal(
        ethers.ZeroAddress,
      );
      expect(await administrable.emergencyStartTime()).to.equal(0);
    });

    it("Should prevent resolving emergency when not in emergency", async function () {
      await expect(
        administrable.connect(owner).resolveEmergency(),
      ).to.be.revertedWith("Emergency mode required");
    });

    it("Should allow emergency admin addition during emergency", async function () {
      await administrable.connect(admin1).triggerEmergency();

      await expect(
        administrable
          .connect(admin1)
          .emergencyAddAdmin(newAdmin.address, AdminRole.RECOVERY_ADMIN),
      )
        .to.emit(administrable, "AdminAdded")
        .withArgs(newAdmin.address, AdminRole.RECOVERY_ADMIN);

      expect(await administrable.isAdmin(newAdmin.address)).to.be.true;
      expect(await administrable.getAdminRole(newAdmin.address)).to.equal(
        AdminRole.RECOVERY_ADMIN,
      );
    });

    it("Should prevent emergency admin addition when not in emergency", async function () {
      await expect(
        administrable
          .connect(admin1)
          .emergencyAddAdmin(newAdmin.address, AdminRole.RECOVERY_ADMIN),
      ).to.be.revertedWith("Emergency mode required");
    });

    it("Should prevent normal operations during emergency", async function () {
      await administrable.connect(admin1).triggerEmergency();

      await expect(
        administrable
          .connect(owner)
          .addAdmin(newAdmin.address, AdminRole.TEAM_MANAGER),
      ).to.be.revertedWith("Contract is in emergency mode");

      await expect(
        administrable
          .connect(owner)
          .changeAdminRole(admin2.address, AdminRole.VOTE_ADMIN),
      ).to.be.revertedWith("Contract is in emergency mode");
    });
  });

  describe("🔍 Access Control & Modifiers", function () {
    it("Should validate admin access correctly", async function () {
      // Super admin should pass all role checks
      expect(await administrable.hasRole(owner.address, AdminRole.TEAM_MANAGER))
        .to.be.true;
      expect(await administrable.hasRole(owner.address, AdminRole.VOTE_ADMIN))
        .to.be.true;
      expect(
        await administrable.hasRole(owner.address, AdminRole.RECOVERY_ADMIN),
      ).to.be.true;
      expect(await administrable.hasRole(owner.address, AdminRole.SUPER_ADMIN))
        .to.be.true;

      // Non-admin should fail all checks
      expect(
        await administrable.hasRole(nonAdmin.address, AdminRole.TEAM_MANAGER),
      ).to.be.false;
    });

    it("Should validate role hierarchy correctly", async function () {
      await administrable
        .connect(owner)
        .changeAdminRole(admin1.address, AdminRole.TEAM_MANAGER);

      // TEAM_MANAGER should pass TEAM_MANAGER check but not higher roles
      expect(
        await administrable.hasRole(admin1.address, AdminRole.TEAM_MANAGER),
      ).to.be.true;
      expect(await administrable.hasRole(admin1.address, AdminRole.VOTE_ADMIN))
        .to.be.false;
      expect(
        await administrable.hasRole(admin1.address, AdminRole.RECOVERY_ADMIN),
      ).to.be.false;
      expect(await administrable.hasRole(admin1.address, AdminRole.SUPER_ADMIN))
        .to.be.false;
    });

    it("Should handle inactive admins correctly", async function () {
      await administrable
        .connect(owner)
        .addAdmin(newAdmin.address, AdminRole.TEAM_MANAGER);
      await administrable.connect(owner).removeAdmin(newAdmin.address);

      expect(await administrable.isAdmin(newAdmin.address)).to.be.false;
      expect(
        await administrable.hasRole(newAdmin.address, AdminRole.TEAM_MANAGER),
      ).to.be.false;

      const adminInfo = await administrable.getAdminInfo(newAdmin.address);
      expect(adminInfo.isActive).to.be.false;
    });
  });

  describe("📊 View Functions", function () {
    it("Should return correct admin information", async function () {
      const adminInfo = await administrable.getAdminInfo(owner.address);

      expect(adminInfo.role).to.equal(AdminRole.SUPER_ADMIN);
      expect(adminInfo.isActive).to.be.true;
      expect(adminInfo.joinTimestamp).to.be.gt(0);
    });

    it("Should return correct admin role", async function () {
      expect(await administrable.getAdminRole(owner.address)).to.equal(
        AdminRole.SUPER_ADMIN,
      );
      expect(await administrable.getAdminRole(nonAdmin.address)).to.equal(
        AdminRole.NONE,
      );
    });

    it("Should return empty info for non-admin", async function () {
      const adminInfo = await administrable.getAdminInfo(nonAdmin.address);

      expect(adminInfo.role).to.equal(AdminRole.NONE);
      expect(adminInfo.isActive).to.be.false;
      expect(adminInfo.joinTimestamp).to.equal(0);
    });

    it("Should update admin list correctly", async function () {
      // Add new admin
      await administrable
        .connect(owner)
        .addAdmin(newAdmin.address, AdminRole.TEAM_MANAGER);
      let allAdmins = await administrable.getAllAdmins();
      expect(allAdmins).to.have.lengthOf(4);
      expect(allAdmins).to.include(newAdmin.address);

      // Remove admin
      await administrable.connect(owner).removeAdmin(newAdmin.address);
      allAdmins = await administrable.getAllAdmins();
      expect(allAdmins).to.have.lengthOf(3);
      expect(allAdmins).to.not.include(newAdmin.address);
    });
  });

  describe("🛡️ Security & Edge Cases", function () {
    it("Should handle minimum admin requirements", async function () {
      await expect(
        new ethers.ContractFactory(
          await ethers
            .getContractFactory("Administrable")
            .then((f) => f.interface.fragments),
          await ethers
            .getContractFactory("Administrable")
            .then((f) => f.bytecode),
          owner,
        ).deploy([]), // Empty admin list
      ).to.be.revertedWith("At least 1 initial admin required");
    });

    it("Should prevent adding zero address in constructor", async function () {
      await expect(
        new ethers.ContractFactory(
          await ethers
            .getContractFactory("Administrable")
            .then((f) => f.interface.fragments),
          await ethers
            .getContractFactory("Administrable")
            .then((f) => f.bytecode),
          owner,
        ).deploy([ethers.ZeroAddress]),
      ).to.be.revertedWith("Invalid admin address");
    });

    it("Should handle role transitions correctly", async function () {
      // Change role multiple times
      await administrable
        .connect(owner)
        .changeAdminRole(admin1.address, AdminRole.TEAM_MANAGER);
      expect(await administrable.getAdminRole(admin1.address)).to.equal(
        AdminRole.TEAM_MANAGER,
      );

      await administrable
        .connect(owner)
        .changeAdminRole(admin1.address, AdminRole.VOTE_ADMIN);
      expect(await administrable.getAdminRole(admin1.address)).to.equal(
        AdminRole.VOTE_ADMIN,
      );

      await administrable
        .connect(owner)
        .changeAdminRole(admin1.address, AdminRole.SUPER_ADMIN);
      expect(await administrable.getAdminRole(admin1.address)).to.equal(
        AdminRole.SUPER_ADMIN,
      );
    });

    it("Should maintain data consistency during admin operations", async function () {
      const initialCount = await administrable.totalAdmins();

      // Add and remove admin
      await administrable
        .connect(owner)
        .addAdmin(newAdmin.address, AdminRole.TEAM_MANAGER);
      expect(await administrable.totalAdmins()).to.equal(initialCount + 1n);

      await administrable.connect(owner).removeAdmin(newAdmin.address);
      expect(await administrable.totalAdmins()).to.equal(initialCount);

      // Verify admin list consistency
      const finalAdmins = await administrable.getAllAdmins();
      expect(finalAdmins).to.have.lengthOf(Number(initialCount));
    });
  });
});
