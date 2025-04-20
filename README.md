# Personal Training Smart Contract

This project demonstrates a basic Hardhat use case. It includes a smart contract for managing personal training sessions, a deployment script, and tests for the contract.

## Getting Started

### Install Dependencies
Make sure to install all dependencies before proceeding:
```shell
npm install
```

---

## Deployment

### Deploy to a Local Blockchain
1. Start a local Hardhat node:
   ```shell
   npx hardhat node
   ```

2. Deploy the contract to the local blockchain:
   ```shell
   npx hardhat run scripts/deploy.js --network localhost
   ```

### Deploy to a Public Testnet (e.g., Goerli)
1. Configure your `hardhat.config.js` with your Infura/Alchemy project ID and private key.
2. Deploy the contract:
   ```shell
   npx hardhat run scripts/deploy.js --network goerli
   ```

---

## Testing

### Run Tests
To run the tests for the contract, use the following command:
```shell
npx hardhat test
```

### Run Tests with Gas Report
To include a gas usage report, run:
```shell
REPORT_GAS=true npx hardhat test
```

---

## Additional Hardhat Tasks
Here are some additional Hardhat tasks you can try:
```shell
npx hardhat help
npx hardhat compile
npx hardhat console --network localhost
```