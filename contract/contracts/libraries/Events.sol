// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Events
 * @dev Defines all events emitted by the ChitChainManager contract.
 */
library Events {
    event UserRegistered(address indexed user);
    event SchemeCreated(uint256 indexed schemeId, address indexed organizer, string schemeName);
    event UserJoinedScheme(uint256 indexed schemeId, address indexed user);
    event ContributionMade(
        uint256 indexed schemeId,
        uint256 indexed cycle,
        address indexed contributor,
        uint256 amount
    );
    event BidPlaced(uint256 indexed schemeId, uint256 indexed cycle, address indexed bidder, uint256 amount);
    event WinnerSelected(uint256 indexed schemeId, uint256 indexed cycle, address indexed winner, uint256 amount);
    event DividendDistributed(uint256 indexed schemeId, uint256 indexed cycle, address indexed member, uint256 amount);
    event SchemeCompleted(uint256 indexed schemeId);
    event RandomnessRequested(uint256 indexed schemeId, uint256 indexed cycle, uint64 sequenceNumber);
}
