const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy MockERC20 for testing (governance token)
  console.log("1️⃣  Deploying MockERC20 (Governance Token)...");
  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  const initialSupply = hre.ethers.parseEther("1000000"); // 1M tokens
  const governanceToken = await MockERC20.deploy("Governance Token", "GOV", initialSupply);
  await governanceToken.waitForDeployment();
  const governanceTokenAddress = await governanceToken.getAddress();
  console.log("✅ Governance Token deployed to:", governanceTokenAddress);
  console.log("✅ Initial supply:", hre.ethers.formatEther(initialSupply), "GOV tokens\n");

  // Deploy MockERC20 for meme tokens (for testing)
  console.log("2️⃣  Deploying MockERC20 (Meme Tokens for testing)...");
  const memeSupply = hre.ethers.parseEther("1000000"); // 1M tokens each

  const memeToken1 = await MockERC20.deploy("Doge Coin", "DOGE", memeSupply);
  await memeToken1.waitForDeployment();
  const memeToken1Address = await memeToken1.getAddress();
  console.log("✅ Meme Token 1 (DOGE) deployed to:", memeToken1Address);

  const memeToken2 = await MockERC20.deploy("Pepe Coin", "PEPE", memeSupply);
  await memeToken2.waitForDeployment();
  const memeToken2Address = await memeToken2.getAddress();
  console.log("✅ Meme Token 2 (PEPE) deployed to:", memeToken2Address + "\n");

  // Deploy TeamsManagerCore
  console.log("3️⃣  Deploying TeamsManagerCore...");
  const TeamsManager = await hre.ethers.getContractFactory("TeamsManagerCore");

  // Constructor params: initialAdmins[], stakingToken, minimumStake
  const initialAdmins = [deployer.address]; // Deployer as initial admin
  const minimumStake = hre.ethers.parseEther("1000"); // Not used in simplified version but required for constructor

  const teamsManager = await TeamsManager.deploy(
    initialAdmins,
    governanceTokenAddress,
    minimumStake
  );
  await teamsManager.waitForDeployment();
  const teamsManagerAddress = await teamsManager.getAddress();
  console.log("✅ TeamsManagerCore deployed to:", teamsManagerAddress);

  // Set voting token
  console.log("\n4️⃣  Configuring TeamsManagerCore...");
  await teamsManager.setVotingToken(governanceTokenAddress);
  console.log("✅ Set voting token to:", governanceTokenAddress);

  // Get admin info
  const adminRole = await teamsManager.getAdminRole(deployer.address);
  console.log("✅ Deployer admin role:", adminRole.toString(), "(4 = SUPER_ADMIN)");

  // Save deployment info
  console.log("\n5️⃣  Saving deployment info...");

  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      TeamsManagerCore: teamsManagerAddress,
      GovernanceToken: governanceTokenAddress,
      MemeToken1_DOGE: memeToken1Address,
      MemeToken2_PEPE: memeToken2Address
    }
  };

  const deploymentPath = path.join(__dirname, "..", "deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("✅ Deployment info saved to deployment.json");

  // Create .env.local file
  const envContent = `# Auto-generated during deployment
NEXT_PUBLIC_TEAM_MANAGER_ADDRESS=${teamsManagerAddress}
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_EXPLORER=http://localhost:3000
NEXT_PUBLIC_PINATA_URL=https://gateway.pinata.cloud/ipfs/
NEXT_PUBLIC_GOVERNANCE_TOKEN=${governanceTokenAddress}

# Test accounts (for reference)
DEPLOYER_ADDRESS=${deployer.address}
MEME_TOKEN_1_ADDRESS=${memeToken1Address}
MEME_TOKEN_2_ADDRESS=${memeToken2Address}
`;

  const envPath = path.join(__dirname, "..", ".env.local");
  fs.writeFileSync(envPath, envContent);
  console.log("✅ .env.local file created\n");

  // Summary
  console.log("=" .repeat(60));
  console.log("🎉 DEPLOYMENT SUCCESSFUL!");
  console.log("=" .repeat(60));
  console.log("\n📋 Contract Addresses:");
  console.log("   TeamsManagerCore:", teamsManagerAddress);
  console.log("   Governance Token:", governanceTokenAddress);
  console.log("   Meme Token 1 (DOGE):", memeToken1Address);
  console.log("   Meme Token 2 (PEPE):", memeToken2Address);
  console.log("\n💡 Next Steps:");
  console.log("   1. Copy .env.local to .env if needed");
  console.log("   2. Run: npm run dev");
  console.log("   3. Connect MetaMask to http://127.0.0.1:8545");
  console.log("   4. Import deployer account to MetaMask");
  console.log("   5. You'll have 1M GOV tokens to vote with!");
  console.log("\n🔑 Admin Account:", deployer.address);
  console.log("   Role: SUPER_ADMIN (Full permissions)");
  console.log("\n" + "=" .repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });