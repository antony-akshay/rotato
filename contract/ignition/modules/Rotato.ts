import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Directly use the entropy address without parameters
const ENTROPY_ADDRESS = "0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344";

const ChitChainModule = buildModule("ChitChainModule", (m: any) => {
  /**
   * CONTRACT DEPLOYMENTS
   * Each contract in your system is deployed here.
   */

  // 1. Deploy the ChitChainToken contract (no constructor arguments)
  const chitChainToken = m.contract("ChitChainToken");

  // 2. Deploy the ChitChainRegistry contract (no constructor arguments)
  const chitChainRegistry = m.contract("ChitChainRegistry");

  // 3. Deploy the ChitChainInsurance contract (no constructor arguments)
  const chitChainInsurance = m.contract("ChitChainInsurance");

  // 4. Deploy the ChitChainFactory contract, passing the entropy address to its constructor.
  const chitChainFactory = m.contract("ChitChainFactory", [ENTROPY_ADDRESS]);

  // 5. Deploy the main ChitChainManager contract, also passing the entropy address.
  const chitChainManager = m.contract("ChitChainManager", [ENTROPY_ADDRESS]);

  /**
   * POST-DEPLOYMENT SETUP
   * After the contracts are deployed, we need to call some functions to connect them.
   */

  // Authorize the main ChitChainManager contract to interact with the ChitChainInsurance contract.
  m.call(chitChainInsurance, "authorizeScheme", [chitChainManager]);

  // Register the main ChitChainManager contract with the ChitChainRegistry.
  m.call(chitChainRegistry, "registerScheme", [chitChainManager]);

  /**
   * RETURN VALUES
   */
  return {
    chitChainToken,
    chitChainRegistry,
    chitChainInsurance,
    chitChainFactory,
    chitChainManager,
  };
});

export default ChitChainModule;
