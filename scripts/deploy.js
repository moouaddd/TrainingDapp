const hre = require("hardhat");

async function main() {
  const PersonalTraining = await hre.ethers.getContractFactory("PersonalTraining");
  const personalTraining = await PersonalTraining.deploy();

  await personalTraining.deployed();
  console.log("PersonalTraining deployed to:", personalTraining.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});