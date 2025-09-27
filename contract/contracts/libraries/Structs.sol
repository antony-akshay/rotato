// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Structs
 * @dev Defines the core data structures for the ChitChain ecosystem.
 */
library Structs {
    struct ChitScheme {
        uint256 schemeId;
        address organizer;
        string schemeName;
        uint256 monthlyAmount;
        uint256 totalCycles;
        uint256 currentCycle;
        uint256 maxMembers;
        address[] members;
        bool isActive;
        uint256 createdAt;
        uint256 lastCycleStart;
    }

    struct CycleData {
        uint256 totalPool;
        uint256 contributionsReceived;
        address[] contributors;
        address[] bidders;
        mapping(address => uint256) contributions;
        mapping(address => uint256) bids;
        mapping(address => bool) hasContributed;
        mapping(address => bool) hasBid;
        address winner;
        uint256 winningBid;
        bool isComplete;
        uint64 entropySequenceNumber;
    }

    struct UserProfile {
        bool isRegistered;
        uint256[] participatingSchemes;
        uint256 totalEarnings;
        uint256 totalContributions;
        uint256 schemesWon;
    }
}
