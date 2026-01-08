const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying AdvancedGovernance contract...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Read existing deployment
  const deploymentPath = path.join(__dirname, "..", "deployment.json");
  let existingDeployment = {};

  if (fs.existsSync(deploymentPath)) {
    existingDeployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    console.log("✅ Found existing deployment");
    console.log("   TeamsManagerCore:", existingDeployment.contracts.TeamsManagerCore);
    console.log("   GovernanceToken:", existingDeployment.contracts.GovernanceToken);
    console.log("");
  } else {
    console.error("❌ No existing deployment found. Run deploy.js first.");
    process.exit(1);
  }

  const governanceTokenAddress = existingDeployment.contracts.GovernanceToken;

  // Get hardhat test accounts
  const accounts = await hre.ethers.getSigners();

  // Deploy AdvancedGovernance
  console.log("1️⃣  Deploying AdvancedGovernance...");
  const AdvancedGovernance = await hre.ethers.getContractFactory("AdvancedGovernance");

  // Constructor params: initialAdmins[], stakingToken, minimumStake
  const governanceAdmins = [
    deployer.address,      // Account 0
    accounts[1].address,   // Account 1
    accounts[2].address    // Account 2
  ]; // Need at least 3 admins

  const governanceMinStake = hre.ethers.parseEther("1000"); // 1000 tokens minimum stake

  const advancedGovernance = await AdvancedGovernance.deploy(
    governanceAdmins,
    governanceTokenAddress,
    governanceMinStake
  );
  await advancedGovernance.waitForDeployment();
  const advancedGovernanceAddress = await advancedGovernance.getAddress();

  console.log("✅ AdvancedGovernance deployed to:", advancedGovernanceAddress);
  console.log("✅ Initial admins:", governanceAdmins.length);
  console.log("   -", deployer.address);
  console.log("   -", accounts[1].address);
  console.log("   -", accounts[2].address);

  const requiredConf = await advancedGovernance.requiredConfirmations();
  console.log("✅ Required confirmations:", requiredConf.toString());
  console.log("✅ Minimum stake:", hre.ethers.formatEther(governanceMinStake), "GOV");

  // Update deployment.json
  console.log("\n2️⃣  Updating deployment info...");
  existingDeployment.contracts.AdvancedGovernance = advancedGovernanceAddress;
  existingDeployment.timestamp = new Date().toISOString();

  fs.writeFileSync(deploymentPath, JSON.stringify(existingDeployment, null, 2));
  console.log("✅ deployment.json updated");

  // Update .env.local
  console.log("\n3️⃣  Updating .env.local...");
  const envPath = path.join(__dirname, "..", ".env.local");
  let envContent = fs.readFileSync(envPath, 'utf8');

  // Add governance address if not already present
  if (!envContent.includes('NEXT_PUBLIC_ADVANCED_GOVERNANCE_ADDRESS')) {
    envContent += `NEXT_PUBLIC_ADVANCED_GOVERNANCE_ADDRESS=${advancedGovernanceAddress}\n`;
  } else {
    // Replace existing governance address
    envContent = envContent.replace(
      /NEXT_PUBLIC_ADVANCED_GOVERNANCE_ADDRESS=.*/,
      `NEXT_PUBLIC_ADVANCED_GOVERNANCE_ADDRESS=${advancedGovernanceAddress}`
    );
  }

  fs.writeFileSync(envPath, envContent);
  console.log("✅ .env.local updated");

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT SUCCESSFUL!");
  console.log("=".repeat(60));
  console.log("\n📋 AdvancedGovernance Contract:");
  console.log("   Address:", advancedGovernanceAddress);
  console.log("   Staking Token:", governanceTokenAddress);
  console.log("   Min Stake:", hre.ethers.formatEther(governanceMinStake), "GOV");
  console.log("\n👥 Governance Admins:");
  console.log("   1.", deployer.address, "(Deployer)");
  console.log("   2.", accounts[1].address);
  console.log("   3.", accounts[2].address);
  console.log("\n⚖️  Multi-Sig Settings:");
  console.log("   Required Confirmations:", requiredConf.toString(), "of", governanceAdmins.length);
  console.log("   Approval Threshold: 60%");
  console.log("\n💡 Next Steps:");
  console.log("   1. Restart your dev server: npm run dev");
  console.log("   2. Navigate to /admin/governance");
  console.log("   3. Create proposals and test multi-sig voting");
  console.log("   4. Navigate to /admin/timelock");
  console.log("   5. Schedule time-locked actions");
  console.log("\n" + "=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
