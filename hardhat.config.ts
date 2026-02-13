import '@nomicfoundation/hardhat-toolbox';
import { HardhatUserConfig } from 'hardhat/types';
import * as dotenv from "dotenv";

import "./tasks/deploy";


dotenv.config();
const config: HardhatUserConfig = {
    solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    rskTestnet: {
      url: `${process.env.NEXT_PUBLIC_RPC_URL}`,
      chainId: 31,
      gasPrice: 60000000, // 0.06 Gwei - Minimum required by RSK
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      rskTestnet: "any-string-works",
      rskMainnet: "any-string-works",
    },
    customChains: [
      {
        network: "rskTestnet",
        chainId: 31,
        urls: {
          apiURL: "https://rootstock-testnet.blockscout.com/api/",
          browserURL: "https://rootstock-testnet.blockscout.com/",
        },
      },
      {
        network: "rskMainnet",
        chainId: 30,
        urls: {
          apiURL: "https://rootstock.blockscout.com/api/",
          browserURL: "https://rootstock.blockscout.com/",
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
    paths: {
        root: './',

    },

};

export default config;
