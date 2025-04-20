const hre = require("hardhat");

async function main() {
  // Obtén el contrato a desplegar
  const PersonalTraining = await hre.ethers.getContractFactory("PersonalTraining");

  // Despliega el contrato
  const personalTraining = await PersonalTraining.deploy();

  // Espera a que el contrato sea minado
  await personalTraining.waitForDeployment();

  console.log("PersonalTraining deployed to:", personalTraining.target);
}

// Manejo de errores
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});