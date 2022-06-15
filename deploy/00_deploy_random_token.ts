import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { parseEther } from 'ethers/lib/utils';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer, user, keeper_node, operator_node } = await getNamedAccounts();

  await deploy('RandomToken', {
    from: deployer,
    proxy: {
      owner: deployer,
      execute: {
        init: {
          methodName: 'initializeToken',
          args: [parseEther('10000000000').toString()],
        },
      },
      proxyContract: 'OpenZeppelinTransparentProxy'
    },

    log: true,
    deterministicDeployment: process.env.DETERMINISTIC === 'true',
  });
};

export default func;
func.tags = ['Core', 'RandomToken'];