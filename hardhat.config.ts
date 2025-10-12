import '@typechain/hardhat';
import '@nomicfoundation/hardhat-ethers';
import '@nomicfoundation/hardhat-chai-matchers';
import '@nomicfoundation/hardhat-toolbox';
import { HardhatUserConfig } from 'hardhat/types';

const config: HardhatUserConfig = {
    solidity: {
        version: '0.8.20',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
    paths: {
        root: './',
    },
};

module.exports = config;