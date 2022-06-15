// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { run, ethers, deployments } from "hardhat";
import { abi as StrategyFactoryABI } from "../artifacts/contracts/StrategyFactory.sol/StrategyFactory.json";
import { abi as StrategyABI } from "../artifacts/contracts/Strategy.sol/Strategy.json";
import { Strategy, StrategyFactory, Strategy__factory } from "../types";


async function main() {
  // await run('compile');
  const DeployedStrategy = await deployments.get('Strategy');
  const DeployedStrategyFactory = await deployments.get('StrategyFactory');

  const strategy = await ethers.getContractAt(StrategyABI, '0xc11258046d67f055a2f1470a3c41e85a11ed161d') as Strategy;
  const factory = await ethers.getContractAt(StrategyFactoryABI, DeployedStrategyFactory.address) as StrategyFactory;

  console.log('DeployedStrategy', DeployedStrategy.address)
  console.log('DeployedStrategyFactory', DeployedStrategyFactory.address)
  console.log('Monday Test', ethers.utils.formatBytes32String('Monday Test'))

  const deployedStrategy = await factory.createStrategy(
    ethers.utils.formatBytes32String('Example Strategy2'),
    '0x0357415D1430a862B93676C2aCe91991036a077C', 
    '0xf654A0BDD40D457fb4AD2be66000AcceE65A3e85',
    'https://google.com',
    'https://google.com',
    'QmT4AeWE9Q9EaoyLJiqaZuYQ8mJeq4ZBncjjFH9dQ9uDVA',
    'QmT4AeWE9Q9EaoyLJiqaZuYQ8mJeq4ZBncjjFH9dQ9uDVB',
    { gasLimit: '2000000' }
  );

  await deployedStrategy.wait()

  console.log('deployedStrategy', deployedStrategy.hash)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
