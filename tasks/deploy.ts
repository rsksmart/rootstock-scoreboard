import { task } from "hardhat/config";

task("deploy-scoreboard", "Deploys and verifies the governance scoreboard")
  .addOptionalParam("token", "The address of an existing ERC20 token")
  .setAction(async (taskArgs, hre) => {
    const [deployer] = await hre.ethers.getSigners();
    console.log(`Contract Deployer: ${deployer.address}`);

    let tokenAddr = taskArgs.token;
    let deployedMock = false;
    // mock token data is passed if the user provides no existing token address
    let mockTokenName = "Governance Token";
    let mockTokenSymbol = "GOV";
    let mockTokenAmount = hre.ethers.parseEther("1000000");

    const explorerBaseUrl = process.env.NEXT_PUBLIC_EXPLORER!;
    // check if token address was passed in
    if (tokenAddr) {
      console.log(`🔗 Using existing token: ${tokenAddr}`);
    } else {
      console.log("⚠️ No token provided. Deploying MockERC20...");
      const Mock = await hre.ethers.getContractFactory("MockERC20");
      const mock = await Mock.deploy(
        mockTokenName,
        mockTokenSymbol,
        mockTokenAmount
      );
      await mock.waitForDeployment();
      tokenAddr = await mock.getAddress();
      deployedMock = true;
      console.log(`✅ MockERC20 deployed to: ${tokenAddr}`);
    }

    console.log("Deploying TeamsManagerCore...");
    const TeamsManager = await hre.ethers.getContractFactory(
      "TeamsManagerCore"
    );

    const manager = await TeamsManager.deploy(
      [deployer.address],
      tokenAddr,
      hre.ethers.parseEther("100")
    );

    await manager.waitForDeployment();
    const managerAddr = await manager.getAddress();
    console.log(`TeamsManagerCore deployed to: ${managerAddr}`);

    console.log("Linking voting token...");
    const tx = await manager.setVotingToken(tokenAddr);
    await tx.wait();
    console.log("⚙️ Voting token linked.");

    console.log("\n Deployment Successful!");
    console.log(`NEXT_PUBLIC_TEAM_MANAGER_ADDRESS: ${managerAddr}`);
    console.log(`NEXT_PUBLIC_GOVERNANCE_TOKEN:    ${tokenAddr}`);

    // verify contracts
    console.log("\n🔍 Starting Verification...");
    console.log(
      "Waiting for block confirmations to ensure explorer visibility..."
    );

    // Waiting for ~5-10 seconds  for Rootstock Blockscout to resolve
    await new Promise((resolve) => setTimeout(resolve, 10000));

    if (deployedMock) {
      try {
        await hre.run("verify:verify", {
          address: tokenAddr,
          constructorArguments: [
            "Governance Token",
            "GOV",
            hre.ethers.parseEther("1000000"),
          ],
        });
      } catch (e) {
        console.log("Verification failed for MockERC20: ", e.message);
      }
    }

    try {
      await hre.run("verify:verify", {
        address: managerAddr,
        constructorArguments: [
          [deployer.address],
          tokenAddr,
          hre.ethers.parseEther("100"),
        ],
      });
    } catch (e) {
      console.log("Verification failed for TeamsManagerCore: ", e.message);
    }

    console.log("\n✅ Deployment and Verification Complete!");
    if (deployedMock) {
      console.log(`MockERC20: ${explorerBaseUrl}/address/${tokenAddr}`);
    }
    console.log(`TeamsManagerCore: ${explorerBaseUrl}/address/${managerAddr}`);
  });
