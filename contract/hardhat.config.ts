import type { HardhatUserConfig } from "hardhat/config";

import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import hardhatIgnitionEthersPlugin from "@nomicfoundation/hardhat-ignition-ethers";

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxMochaEthersPlugin, hardhatIgnitionEthersPlugin],
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    kadenaTestnet: {
      type: "http",
      url: "https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/20/evm/rpc",
      accounts: [
        "ae5081ae3b94b43abe00c09a4e401520968621b2de45fb0b576ffa6df2b3301a",
      ],
      chainId: 5920,
    },
  },
};

export default config;
