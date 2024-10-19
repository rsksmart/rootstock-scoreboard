import '@typechain/hardhat';
import '@nomicfoundation/hardhat-ethers';
import '@nomicfoundation/hardhat-chai-matchers';
import '@nomicfoundation/hardhat-toolbox';

const config = {
    solidity: '0.8.19',
    paths: {
        root: './',
    },
};

module.exports = config;