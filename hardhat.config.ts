import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    mainnet: {
      url: process.env.PROVIDER_URL,
      accounts: [process.env.PRIVATE_KEY as string],
    },
    goerli: {
      url: process.env.PROVIDER_URL,
      accounts: [process.env.PRIVATE_KEY as string],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY as string,
  }
};

export default config;
