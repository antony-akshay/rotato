import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// IMPORTANT: Replace this placeholder with the actual Pyth Entropy contract address
// for the network you are deploying to (e.g., Kadena EVM Testnet).
const DEFAULT_ENTROPY_ADDRESS = "0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344";

const ChitChainModule = buildModule("ChitChainModule", (m: any) => {
  /**
   * PARAMETERS
   * The _entropy parameter allows you to specify the Pyth Entropy contract address at deployment time.
   * It defaults to the placeholder address above.
   * Example command to override: `npx hardhat ignition deploy ignition/modules/Rotato.ts --parameters '{"ChitChainModule": {"_entropy": "0xActualEntropyAddress"}}'`
   */
  const entropyAddress = m.getParameter("_entropy", DEFAULT_ENTROPY_ADDRESS);

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
  const chitChainFactory = m.contract("ChitChainFactory", [entropyAddress]);

  // 5. Deploy the main ChitChainManager contract, also passing the entropy address.
  const chitChainManager = m.contract("ChitChainManager", [entropyAddress]);

  /**
   * POST-DEPLOYMENT SETUP
   * After the contracts are deployed, we need to call some functions to connect them.
   */

  // Authorize the main ChitChainManager contract to interact with the ChitChainInsurance contract.
  // This calls the `authorizeScheme` function on the `chitChainInsurance` instance.
  m.call(chitChainInsurance, "authorizeScheme", [chitChainManager]);

  // Register the main ChitChainManager contract with the ChitChainRegistry.
  // This calls the `registerScheme` function on the `chitChainRegistry` instance.
  m.call(chitChainRegistry, "registerScheme", [chitChainManager]);

  /**
   * RETURN VALUES
   * The deployed contract instances are returned, so you can easily interact with them
   * in your tests or frontend applications.
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
