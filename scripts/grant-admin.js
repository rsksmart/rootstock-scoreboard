const hre = require("hardhat");

async function main() {
  const TEAM_MANAGER_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  const NEW_ADMIN_ADDRESS = "0x9b8B7022524FBAa8C3e75C42dB922Ca0d92366A8";

  console.log("🔐 Granting admin role...");
  console.log("Team Manager Contract:", TEAM_MANAGER_ADDRESS);
  console.log("New Admin Address:", NEW_ADMIN_ADDRESS);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer (current admin):", deployer.address);

  const TeamsManager = await hre.ethers.getContractFactory("TeamsManagerCore");
  const teamsManager = TeamsManager.attach(TEAM_MANAGER_ADDRESS);

  // Check current role
  const currentRole = await teamsManager.getAdminRole(NEW_ADMIN_ADDRESS);
  console.log("\n📊 Current role:", currentRole.toString());

  // Grant SUPER_ADMIN role (4)
  console.log("\n⚡ Granting SUPER_ADMIN role...");
  const tx = await teamsManager.addAdmin(NEW_ADMIN_ADDRESS, 4);
  await tx.wait();

  console.log("✅ Transaction hash:", tx.hash);

  // Verify new role
  const newRole = await teamsManager.getAdminRole(NEW_ADMIN_ADDRESS);
  const adminInfo = await teamsManager.getAdminInfo(NEW_ADMIN_ADDRESS);

  console.log("\n✅ New role:", newRole.toString());
  console.log("   Is Active:", adminInfo.isActive);
  console.log("   Join Timestamp:", adminInfo.joinTimestamp.toString());

  const roleNames = {
    0: "NONE",
    1: "TEAM_MANAGER",
    2: "VOTE_ADMIN",
    3: "RECOVERY_ADMIN",
    4: "SUPER_ADMIN"
  };

  console.log("\n🎉 Success! Role granted:", roleNames[Number(newRole)]);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });