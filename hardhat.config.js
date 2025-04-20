require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ignition"); 

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 1337,
    },
  },
};