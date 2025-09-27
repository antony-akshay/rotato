// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Errors
 * @dev Defines all custom errors for the ChitChainManager contract.
 */
library Errors {
    error OnlyOrganizer();
    error OnlyMember();
    error InvalidAmount();
    error InvalidPeriod();
    error SchemeNotActive();
    error AlreadyMember();
    error MaxMembersReached();
    error ContributionPeriodEnded();
    error BiddingPeriodEnded();
    error BidTooLow();
    error AlreadyContributed();
    error AlreadyBid();
    error NotEligibleToBid();
    error NoBidsReceived();
    error WinnerAlreadySelected();
    error InsufficientBalance();
}
