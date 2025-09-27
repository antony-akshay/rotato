// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ChitChainRegistry
 * @dev Registry contract to track all schemes and provide global stats
 */
contract ChitChainRegistry is Ownable {
    struct GlobalStats {
        uint256 totalSchemes;
        uint256 totalUsers;
        uint256 totalValueLocked;
        uint256 totalCompletedCycles;
    }

    mapping(address => bool) public registeredSchemes;
    address[] public allSchemes;
    GlobalStats public stats;

    event SchemeRegistered(address indexed scheme);
    event StatsUpdated(uint256 totalSchemes, uint256 totalUsers, uint256 tvl);

    function registerScheme(address _scheme) external onlyOwner {
        require(!registeredSchemes[_scheme], "Already registered");

        registeredSchemes[_scheme] = true;
        allSchemes.push(_scheme);
        stats.totalSchemes++;

        emit SchemeRegistered(_scheme);
    }

    function updateStats(uint256 _totalUsers, uint256 _totalValueLocked, uint256 _completedCycles) external {
        require(registeredSchemes[msg.sender], "Not a registered scheme");

        stats.totalUsers = _totalUsers;
        stats.totalValueLocked = _totalValueLocked;
        stats.totalCompletedCycles = _completedCycles;

        emit StatsUpdated(stats.totalSchemes, stats.totalUsers, stats.totalValueLocked);
    }

    function getAllSchemes() external view returns (address[] memory) {
        return allSchemes;
    }
}
