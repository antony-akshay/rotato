// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@pythnetwork/entropy-sdk-solidity/IEntropy.sol";
import "@pythnetwork/entropy-sdk-solidity/IEntropyConsumer.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./libraries/Structs.sol";
import "./libraries/Events.sol";
import "./libraries/Errors.sol";

/**
 * @title ChitChainManager
 * @dev Main contract managing all chit schemes with Pyth Entropy integration
 */
contract ChitChainManager is IEntropyConsumer, ReentrancyGuard, Ownable, Pausable {
    using Structs for Structs.ChitScheme;
    using Structs for Structs.CycleData;
    using Structs for Structs.UserProfile;

    IEntropy private entropy;

    // Constants
    uint256 public constant INVESTMENT_PERIOD = 5 days;
    uint256 public constant BIDDING_PERIOD = 5 days;
    uint256 public constant ORGANIZER_FEE_PERCENT = 5;
    uint256 public constant MIN_BID_PERCENT = 75; // Minimum 75% of pool
    uint256 public constant CYCLE_LENGTH = 30 days;

    // State variables
    uint256 public nextSchemeId;
    mapping(uint256 => Structs.ChitScheme) public schemes;
    mapping(uint256 => mapping(uint256 => Structs.CycleData)) public cycleData; // schemeId => cycle => data
    mapping(address => Structs.UserProfile) public users;
    mapping(uint64 => uint256) public entropyToScheme; // entropy sequence => scheme ID
    mapping(uint64 => uint256) public entropyCycle; // entropy sequence => cycle number

    constructor(address _entropy) {
        entropy = IEntropy(_entropy);
        nextSchemeId = 1;
    }

    // User Registration
    function registerUser() external {
        if (users[msg.sender].isRegistered) revert("Already registered");
        users[msg.sender].isRegistered = true;
        emit Events.UserRegistered(msg.sender);
    }

    // Scheme Creation
    function createScheme(
        string memory _schemeName,
        uint256 _monthlyAmount,
        uint256 _totalCycles,
        uint256 _maxMembers
    ) external whenNotPaused returns (uint256) {
        if (!users[msg.sender].isRegistered) revert("Must be registered");
        if (_monthlyAmount == 0) revert Errors.InvalidAmount();
        if (_totalCycles == 0 || _totalCycles > 60) revert("Invalid cycle count");
        if (_maxMembers < 2 || _maxMembers > 100) revert("Invalid member count");

        uint256 schemeId = nextSchemeId++;

        Structs.ChitScheme storage scheme = schemes[schemeId];
        scheme.schemeId = schemeId;
        scheme.organizer = msg.sender;
        scheme.schemeName = _schemeName;
        scheme.monthlyAmount = _monthlyAmount;
        scheme.totalCycles = _totalCycles;
        scheme.currentCycle = 0;
        scheme.maxMembers = _maxMembers;
        scheme.isActive = true;
        scheme.createdAt = block.timestamp;

        scheme.members.push(msg.sender);
        users[msg.sender].participatingSchemes.push(schemeId);

        emit Events.SchemeCreated(schemeId, msg.sender, _schemeName);
        return schemeId;
    }

    // Join Scheme
    function joinScheme(uint256 _schemeId) external whenNotPaused {
        if (!users[msg.sender].isRegistered) revert("Must be registered");
        Structs.ChitScheme storage scheme = schemes[_schemeId];
        if (!scheme.isActive) revert Errors.SchemeNotActive();
        if (scheme.members.length >= scheme.maxMembers) revert Errors.MaxMembersReached();

        for (uint256 i = 0; i < scheme.members.length; i++) {
            if (scheme.members[i] == msg.sender) revert Errors.AlreadyMember();
        }

        scheme.members.push(msg.sender);
        users[msg.sender].participatingSchemes.push(_schemeId);

        emit Events.UserJoinedScheme(_schemeId, msg.sender);
    }

    // Start new cycle
    function startNewCycle(uint256 _schemeId) external whenNotPaused {
        Structs.ChitScheme storage scheme = schemes[_schemeId];
        if (!scheme.isActive) revert Errors.SchemeNotActive();
        if (scheme.members.length < 2) revert("Need at least 2 members");

        if (scheme.currentCycle == 0) {
            scheme.currentCycle = 1;
            scheme.lastCycleStart = block.timestamp;
        } else {
            if (block.timestamp < scheme.lastCycleStart + CYCLE_LENGTH) revert("Current cycle not completed");
            if (!cycleData[_schemeId][scheme.currentCycle].isComplete) revert("Previous cycle not completed");

            scheme.currentCycle++;
            scheme.lastCycleStart = block.timestamp;

            if (scheme.currentCycle > scheme.totalCycles) {
                scheme.isActive = false;
                emit Events.SchemeCompleted(_schemeId);
                return;
            }
        }
    }

    // Contribute to current cycle
    function contribute(uint256 _schemeId) external payable nonReentrant whenNotPaused {
        Structs.ChitScheme storage scheme = schemes[_schemeId];
        if (!scheme.isActive) revert Errors.SchemeNotActive();

        bool isMember = false;
        for (uint256 i = 0; i < scheme.members.length; i++) {
            if (scheme.members[i] == msg.sender) {
                isMember = true;
                break;
            }
        }
        if (!isMember) revert Errors.OnlyMember();

        if (msg.value != scheme.monthlyAmount) revert Errors.InvalidAmount();
        if (scheme.currentCycle == 0) revert("No active cycle");

        uint256 cycleStart = scheme.lastCycleStart;
        if (block.timestamp > cycleStart + INVESTMENT_PERIOD) revert Errors.ContributionPeriodEnded();

        Structs.CycleData storage cycle = cycleData[_schemeId][scheme.currentCycle];
        if (cycle.hasContributed[msg.sender]) revert Errors.AlreadyContributed();

        cycle.hasContributed[msg.sender] = true;
        cycle.contributions[msg.sender] = msg.value;
        cycle.contributors.push(msg.sender);
        cycle.totalPool += msg.value;
        cycle.contributionsReceived++;
        users[msg.sender].totalContributions += msg.value;

        emit Events.ContributionMade(_schemeId, scheme.currentCycle, msg.sender, msg.value);
    }
    
    // Place a bid
    function placeBid(uint256 _schemeId, uint256 _bidAmount) external whenNotPaused {
        Structs.ChitScheme storage scheme = schemes[_schemeId];
        if (!scheme.isActive) revert Errors.SchemeNotActive();
        if (scheme.currentCycle == 0) revert("No active cycle");

        Structs.CycleData storage cycle = cycleData[_schemeId][scheme.currentCycle];
        if (!cycle.hasContributed[msg.sender]) revert Errors.NotEligibleToBid();
        if (cycle.hasBid[msg.sender]) revert Errors.AlreadyBid();

        uint256 cycleStart = scheme.lastCycleStart;
        if (block.timestamp <= cycleStart + INVESTMENT_PERIOD || block.timestamp > cycleStart + INVESTMENT_PERIOD + BIDDING_PERIOD) {
            revert Errors.BiddingPeriodEnded();
        }

        uint256 minBid = (cycle.totalPool * MIN_BID_PERCENT) / 100;
        if (_bidAmount < minBid || _bidAmount > cycle.totalPool) revert Errors.BidTooLow();

        cycle.hasBid[msg.sender] = true;
        cycle.bids[msg.sender] = _bidAmount;
        cycle.bidders.push(msg.sender);

        emit Events.BidPlaced(_schemeId, scheme.currentCycle, msg.sender, _bidAmount);
    }

    // Select winner
    function selectWinner(uint256 _schemeId) external payable nonReentrant whenNotPaused {
        Structs.ChitScheme storage scheme = schemes[_schemeId];
        if (!scheme.isActive) revert Errors.SchemeNotActive();
        if (scheme.currentCycle == 0) revert("No active cycle");

        Structs.CycleData storage cycle = cycleData[_schemeId][scheme.currentCycle];
        if (cycle.bidders.length == 0) revert Errors.NoBidsReceived();
        if (cycle.winner != address(0)) revert Errors.WinnerAlreadySelected();

        uint256 cycleStart = scheme.lastCycleStart;
        if(block.timestamp <= cycleStart + INVESTMENT_PERIOD + BIDDING_PERIOD) revert("Bidding period not ended");

        uint128 fee = entropy.getFee(entropy.getDefaultProvider());
        if (msg.value < fee) revert Errors.InsufficientBalance();

        bytes32 seed = keccak256(abi.encodePacked(block.timestamp, _schemeId, scheme.currentCycle));
        uint64 sequenceNumber = entropy.requestWithCallback{ value: fee }(entropy.getDefaultProvider(), seed);

        cycle.entropySequenceNumber = sequenceNumber;
        entropyToScheme[sequenceNumber] = _schemeId;
        entropyCycle[sequenceNumber] = scheme.currentCycle;

        if (msg.value > fee) {
            payable(msg.sender).transfer(msg.value - fee);
        }

        emit Events.RandomnessRequested(_schemeId, scheme.currentCycle, sequenceNumber);
    }
    
    // Entropy callback
    function entropyCallback(uint64 sequenceNumber, address, bytes32 randomNumber) internal override {
        uint256 schemeId = entropyToScheme[sequenceNumber];
        uint256 cycleNum = entropyCycle[sequenceNumber];

        Structs.CycleData storage cycle = cycleData[schemeId][cycleNum];

        if(cycle.bidders.length == 0) revert Errors.NoBidsReceived();
        if(cycle.winner != address(0)) revert Errors.WinnerAlreadySelected();

        uint256 winnerIndex = uint256(randomNumber) % cycle.bidders.length;
        address winner = cycle.bidders[winnerIndex];
        uint256 winningBid = cycle.bids[winner];

        cycle.winner = winner;
        cycle.winningBid = winningBid;

        users[winner].schemesWon++;
        users[winner].totalEarnings += winningBid;

        emit Events.WinnerSelected(schemeId, cycleNum, winner, winningBid);
        _distributeFunds(schemeId, cycleNum);
    }
    
    // Internal function for fund distribution
    function _distributeFunds(uint256 _schemeId, uint256 _cycleNum) internal {
        Structs.ChitScheme storage scheme = schemes[_schemeId];
        Structs.CycleData storage cycle = cycleData[_schemeId][_cycleNum];

        uint256 totalPool = cycle.totalPool;
        uint256 organizerFee = (totalPool * ORGANIZER_FEE_PERCENT) / 100;
        uint256 winnerAmount = cycle.winningBid;
        uint256 dividendPool = totalPool - organizerFee - winnerAmount;

        payable(cycle.winner).transfer(winnerAmount);
        payable(scheme.organizer).transfer(organizerFee);

        if (dividendPool > 0 && cycle.contributors.length > 1) {
            uint256 dividendPerMember = dividendPool / (cycle.contributors.length - 1);
            for (uint256 i = 0; i < cycle.contributors.length; i++) {
                address member = cycle.contributors[i];
                if (member != cycle.winner) {
                    payable(member).transfer(dividendPerMember);
                    users[member].totalEarnings += dividendPerMember;
                    emit Events.DividendDistributed(_schemeId, _cycleNum, member, dividendPerMember);
                }
            }
        }
        cycle.isComplete = true;
    }

    // View functions
    function getScheme(uint256 _schemeId) external view returns (Structs.ChitScheme memory) {
        return schemes[_schemeId];
    }

    function getSchemeMembers(uint256 _schemeId) external view returns (address[] memory) {
        return schemes[_schemeId].members;
    }

    function getCycleInfo(uint256 _schemeId, uint256 _cycle) external view returns (uint256 totalPool, uint256 contributionsReceived, address winner, uint256 winningBid, bool isComplete) {
        Structs.CycleData storage cycle = cycleData[_schemeId][_cycle];
        return (cycle.totalPool, cycle.contributionsReceived, cycle.winner, cycle.winningBid, cycle.isComplete);
    }
    
    function getUserProfile(address _user) external view returns (Structs.UserProfile memory) {
        return users[_user];
    }
    
    function getCurrentCyclePeriod(uint256 _schemeId) external view returns (string memory) {
        Structs.ChitScheme storage scheme = schemes[_schemeId];
        if (!scheme.isActive || scheme.currentCycle == 0) return "INACTIVE";

        uint256 timeElapsed = block.timestamp - scheme.lastCycleStart;
        if (timeElapsed <= INVESTMENT_PERIOD) return "CONTRIBUTION";
        if (timeElapsed <= INVESTMENT_PERIOD + BIDDING_PERIOD) return "BIDDING";
        return "SELECTION";
    }

    function getRandomnessFee() external view returns (uint128) {
        return entropy.getFee(entropy.getDefaultProvider());
    }

    // Admin functions
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    receive() external payable {}
    function getEntropy() internal view virtual override returns (address) {
        return address(entropy);
    }
}
