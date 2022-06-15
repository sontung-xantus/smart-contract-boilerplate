
//Tools
import "@atixlabs/hardhat-time-n-mine";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-solhint";
import "@openzeppelin/hardhat-upgrades";
// import RunnerRegistryDeployment from './deploymentsdeployments/ropsten/RunnerRegistry.json';
// Contract Verification
import "@nomiclabs/hardhat-etherscan"; // Uncomment/comment to enable/disable Etherscan verification (should be used with --network=mainnet only!!)
import "@tenderly/hardhat-tenderly";
import "@typechain/hardhat";
import "dotenv/config";
// Hardhat deploy
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import "hardhat-gas-reporter";
import {HardhatUserConfig, task} from "hardhat/config";
import "solidity-coverage";
import {RandomToken} from "./types";
import {accounts, node_url} from "./utils/configs";


const mnemonic = process.env.MNEMONIC



// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts.slice(0, 7)) {
        const balance = await account.getBalance();
        console.log(
            `${account.address} - ${hre.ethers.utils.formatEther(balance.toString())}`
        );
    }
});

task("send_eth", "Send ETH from account to account")
    .addParam("accountindex", "The account index")
    .addParam("amount", "The amount to send")
    .addParam("accounttoindex", "The address to send to")
    .setAction(async (args, hre) => {
        const accounts = await hre.ethers.getSigners();
        const chosenAccount = accounts[args.accountindex];
        const toAccount = accounts[args.accounttoindex].address;

        await chosenAccount.sendTransaction({
            to: toAccount,
            value: hre.ethers.utils.parseEther(args.amount),
        });
    });

// example use: yarn hardhat mint --amount 1000000 --address 0x47fEd759cA8bA2A7881b17501F3028985680cB9D  --network ropsten
task("mint", "Mint Random to account")
    .addParam("amount", "The amount to send")
    .addParam("address", "The amount to send")
    .setAction(async (args, hre) => {
        const accounts = await hre.ethers.getSigners();
        const chosenAccount = accounts[4];

        const RandomTokenDeployment = await hre.deployments.get("RandomToken");

        const contract = (await hre.ethers.getContractAt(
            "RandomToken",
            RandomTokenDeployment.address,
            chosenAccount
        )) as RandomToken;

        const mintTx = await contract.mint(
            args.address,
            hre.ethers.utils.parseEther(args.amount)
        );

        const transation = await mintTx.wait();

        console.log("Minted transaction: ", transation.transactionHash);
    });

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const config: HardhatUserConfig = {
    networks: {
        rinkeby: {
            url: node_url("rinkeby"),
            accounts: accounts("rinkeby"),
        },
        ropsten: {
            url: node_url("ropsten"),
            accounts: accounts("ropsten"),
            gasMultiplier: 1.2,
        },
        hardhat: {
            gasPrice: process.env.NODE_ENV == "test" ? 21 : "auto",
            tags: ["Core", "Test"],
            loggingEnabled: process.env.EXTENDED_LOGS == "true",
        },
        fuji: {
            url: "https://api.avax-test.network/ext/bc/C/rpc",
            chainId: 43113,
            gasPrice: 35000000000,
            accounts: {mnemonic: mnemonic}
        },
        avax: {
            url: "https://api.avax.network/ext/bc/C/rpc",
            chainId: 43114,
            gasPrice: 60000000000,
            accounts: {mnemonic: mnemonic}
        },
        bnb: {
            // url: "https://speedy-nodes-nyc.moralis.io/73e5c7abf1663d024982473b/bsc/mainnet/",
            // url: "https://silent-polished-dream.bsc.quiknode.pro/b9d11170a8cd13f70c3b739c03bffa2ac33980b8/",
            url: "https://bsc-dataseed.binance.org/",
            // url: "https://speedy-nodes-nyc.moralis.io/ad6a32aa82e5543e4ea21695/bsc/mainnet/",
            chainId: 56,
            gasPrice: 6000000000,
            accounts: {mnemonic}
        },
        bnb_testnet: {
            // url: "https://speedy-nodes-nyc.moralis.io/73e5c7abf1663d024982473b/bsc/testnet/",
            url: "https://data-seed-prebsc-2-s1.binance.org:8545/",
            chainId: 97,
            gasPrice: 10000000001,
            accounts: {mnemonic}
        },
        bnb_devnet: {
            // url: "https://speedy-nodes-nyc.moralis.io/73e5c7abf1663d024982473b/bsc/testnet/",
            url: "https://data-seed-prebsc-2-s2.binance.org:8545/",
            chainId: 97,
            gasPrice: 10000000000,
            accounts: {mnemonic}
        }
    },
    tenderly: {
        project: "project",
        username: 'Randomfinance'
    },
    namedAccounts: {
      deployer: 1,
      user: 4,
      keeper_node: 2,
      operator_node: 3,
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY || "",
    },
    solidity: {
        version: "0.8.10",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
            // metadata: {
            //   // do not include the metadata hash, since this is machine dependent
            //   // and we want all generated code to be deterministic
            //   // https://docs.soliditylang.org/en/v0.7.6/metadata.html
            //   bytecodeHash: "none",
            // },
        },
    },
    gasReporter: {
        enabled: process.env.REPORT_GAS == "true",
        currency: "USD",
    },
    typechain: {
        outDir: "./types",
        target: "ethers-v5",
    },
};

export default config;
