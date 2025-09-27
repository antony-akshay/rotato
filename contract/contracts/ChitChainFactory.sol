// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ChitChainManager.sol";

/**
 * @title ChitChainFactory
 * @dev Factory contract to deploy and manage multiple ChitChain instances
 */
contract ChitChainFactory is Ownable {
    address public immutable entropyAddress;
    address[] public deployedSchemes;
    mapping(address => bool) public isValidScheme;

    event SchemeDeployed(address indexed scheme, address indexed deployer);

    constructor(address _entropy) {
        entropyAddress = _entropy;
    }

    function deployChitChain() external returns (address) {
        ChitChainManager newScheme = new ChitChainManager(entropyAddress);
        newScheme.transferOwnership(msg.sender);

        deployedSchemes.push(address(newScheme));
        isValidScheme[address(newScheme)] = true;

        emit SchemeDeployed(address(newScheme), msg.sender);
        return address(newScheme);
    }

    function getDeployedSchemes() external view returns (address[] memory) {
        return deployedSchemes;
    }
}
