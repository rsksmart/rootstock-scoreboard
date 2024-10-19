import '@typechain/hardhat';
import '@nomicfoundation/hardhat-ethers';
import '@nomicfoundation/hardhat-chai-matchers';
import '@nomicfoundation/hardhat-toolbox';
import { HardhatUserConfig } from 'hardhat/types';

const config: HardhatUserConfig = {
    solidity: '0.8.20',
    paths: {
        root: './',

    },

};

module.exports = config;