// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@pythnetwork/entropy-sdk-solidity/IEntropy.sol";
import "@pythnetwork/entropy-sdk-solidity/IEntropyConsumer.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title ChitChainManager
 * @dev Main contract managing all chit schemes with Pyth Entropy integration
 */
contract ChitChainManager is IEntropyConsumer, ReentrancyGuard, Ownable, Pausable {
    IEntropy private entropy;

    // Constants
    uint256 public constant INVESTMENT_PERIOD = 5 days;
    uint256 public constant BIDDING_PERIOD = 5 days;
    uint256 public constant ORGANIZER_FEE_PERCENT = 5;
    uint256 public constant MIN_BID_PERCENT = 75; // Minimum 75% of pool
    uint256 public constant CYCLE_LENGTH = 30 days;

    // Structs
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

    // State variables
    uint256 public nextSchemeId;
    mapping(uint256 => ChitScheme) public schemes;
    mapping(uint256 => mapping(uint256 => CycleData)) public cycleData; // schemeId => cycle => data
    mapping(address => UserProfile) public users;
    mapping(uint64 => uint256) public entropyToScheme; // entropy sequence => scheme ID
    mapping(uint64 => uint256) public entropyCycle; // entropy sequence => cycle number

    // Events
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

    // Errors
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

    constructor(address _entropy) {
        entropy = IEntropy(_entropy);
        nextSchemeId = 1;
    }

    // User Registration
    function registerUser() external {
        require(!users[msg.sender].isRegistered, "Already registered");
        users[msg.sender].isRegistered = true;
        emit UserRegistered(msg.sender);
    }

    // Scheme Creation
    function createScheme(
        string memory _schemeName,
        uint256 _monthlyAmount,
        uint256 _totalCycles,
        uint256 _maxMembers
    ) external whenNotPaused returns (uint256) {
        require(users[msg.sender].isRegistered, "Must be registered");
        require(_monthlyAmount > 0, "Invalid amount");
        require(_totalCycles > 0 && _totalCycles <= 60, "Invalid cycle count");
        require(_maxMembers >= 2 && _maxMembers <= 100, "Invalid member count");

        uint256 schemeId = nextSchemeId++;

        ChitScheme storage scheme = schemes[schemeId];
        scheme.schemeId = schemeId;
        scheme.organizer = msg.sender;
        scheme.schemeName = _schemeName;
        scheme.monthlyAmount = _monthlyAmount;
        scheme.totalCycles = _totalCycles;
        scheme.currentCycle = 0;
        scheme.maxMembers = _maxMembers;
        scheme.isActive = true;
        scheme.createdAt = block.timestamp;
        scheme.lastCycleStart = 0;

        // Add organizer as first member
        scheme.members.push(msg.sender);
        users[msg.sender].participatingSchemes.push(schemeId);

        emit SchemeCreated(schemeId, msg.sender, _schemeName);
        return schemeId;
    }

    // Join Scheme
    function joinScheme(uint256 _schemeId) external whenNotPaused {
        require(users[msg.sender].isRegistered, "Must be registered");
        ChitScheme storage scheme = schemes[_schemeId];
        require(scheme.isActive, "Scheme not active");
        require(scheme.members.length < scheme.maxMembers, "Max members reached");

        // Check if already a member
        for (uint256 i = 0; i < scheme.members.length; i++) {
            if (scheme.members[i] == msg.sender) revert AlreadyMember();
        }

        scheme.members.push(msg.sender);
        users[msg.sender].participatingSchemes.push(_schemeId);

        emit UserJoinedScheme(_schemeId, msg.sender);
    }

    // Start new cycle (can be called by anyone when time is right)
    function startNewCycle(uint256 _schemeId) external whenNotPaused {
        ChitScheme storage scheme = schemes[_schemeId];
        require(scheme.isActive, "Scheme not active");
        require(scheme.members.length >= 2, "Need at least 2 members");

        // Check if it's time for new cycle
        if (scheme.currentCycle == 0) {
            // First cycle can start anytime after scheme creation
            scheme.currentCycle = 1;
            scheme.lastCycleStart = block.timestamp;
        } else {
            require(block.timestamp >= scheme.lastCycleStart + CYCLE_LENGTH, "Current cycle not completed");
            require(cycleData[_schemeId][scheme.currentCycle].isComplete, "Previous cycle not completed");

            scheme.currentCycle++;
            scheme.lastCycleStart = block.timestamp;

            if (scheme.currentCycle > scheme.totalCycles) {
                scheme.isActive = false;
                emit SchemeCompleted(_schemeId);
                return;
            }
        }

        // Initialize cycle data
        CycleData storage cycle = cycleData[_schemeId][scheme.currentCycle];
        cycle.totalPool = 0;
        cycle.contributionsReceived = 0;
    }

    // Contribute to current cycle (Days 1-5)
    function contribute(uint256 _schemeId) external payable nonReentrant whenNotPaused {
        ChitScheme storage scheme = schemes[_schemeId];
        require(scheme.isActive, "Scheme not active");

        // Check if user is a member
        bool isMember = false;
        for (uint256 i = 0; i < scheme.members.length; i++) {
            if (scheme.members[i] == msg.sender) {
                isMember = true;
                break;
            }
        }
        if (!isMember) revert OnlyMember();

        require(msg.value == scheme.monthlyAmount, "Incorrect amount");
        require(scheme.currentCycle > 0, "No active cycle");

        // Check if within contribution period
        uint256 cycleStart = scheme.lastCycleStart;
        require(
            block.timestamp >= cycleStart && block.timestamp <= cycleStart + INVESTMENT_PERIOD,
            "Not in contribution period"
        );

        CycleData storage cycle = cycleData[_schemeId][scheme.currentCycle];
        require(!cycle.hasContributed[msg.sender], "Already contributed");

        cycle.hasContributed[msg.sender] = true;
        cycle.contributions[msg.sender] = msg.value;
        cycle.contributors.push(msg.sender);
        cycle.totalPool += msg.value;
        cycle.contributionsReceived++;

        users[msg.sender].totalContributions += msg.value;

        emit ContributionMade(_schemeId, scheme.currentCycle, msg.sender, msg.value);
    }

    // Place bid (Days 6-10)
    function placeBid(uint256 _schemeId, uint256 _bidAmount) external whenNotPaused {
        ChitScheme storage scheme = schemes[_schemeId];
        require(scheme.isActive, "Scheme not active");
        require(scheme.currentCycle > 0, "No active cycle");

        // Check if user is a member and contributed
        CycleData storage cycle = cycleData[_schemeId][scheme.currentCycle];
        require(cycle.hasContributed[msg.sender], "Must contribute first");
        require(!cycle.hasBid[msg.sender], "Already bid");

        // Check if within bidding period
        uint256 cycleStart = scheme.lastCycleStart;
        require(
            block.timestamp > cycleStart + INVESTMENT_PERIOD &&
                block.timestamp <= cycleStart + INVESTMENT_PERIOD + BIDDING_PERIOD,
            "Not in bidding period"
        );

        // Validate bid amount
        uint256 minBid = (cycle.totalPool * MIN_BID_PERCENT) / 100;
        require(_bidAmount >= minBid && _bidAmount <= cycle.totalPool, "Invalid bid amount");

        cycle.hasBid[msg.sender] = true;
        cycle.bids[msg.sender] = _bidAmount;
        cycle.bidders.push(msg.sender);

        emit BidPlaced(_schemeId, scheme.currentCycle, msg.sender, _bidAmount);
    }

    // Select winner using Pyth Entropy (Day 11)
    function selectWinner(uint256 _schemeId) external payable nonReentrant whenNotPaused {
        ChitScheme storage scheme = schemes[_schemeId];
        require(scheme.isActive, "Scheme not active");
        require(scheme.currentCycle > 0, "No active cycle");

        CycleData storage cycle = cycleData[_schemeId][scheme.currentCycle];
        require(cycle.bidders.length > 0, "No bids received");
        require(cycle.winner == address(0), "Winner already selected");

        // Check if past bidding period
        uint256 cycleStart = scheme.lastCycleStart;
        require(block.timestamp > cycleStart + INVESTMENT_PERIOD + BIDDING_PERIOD, "Bidding period not ended");

        // Get entropy fee and request randomness
        uint128 fee = entropy.getFee(entropy.getDefaultProvider());
        require(msg.value >= fee, "Insufficient fee");

        bytes32 seed = keccak256(abi.encodePacked(block.timestamp, _schemeId, scheme.currentCycle));

        uint64 sequenceNumber = entropy.requestWithCallback{ value: fee }(entropy.getDefaultProvider(), seed);

        cycle.entropySequenceNumber = sequenceNumber;
        entropyToScheme[sequenceNumber] = _schemeId;
        entropyCycle[sequenceNumber] = scheme.currentCycle;

        // Refund excess payment
        if (msg.value > fee) {
            payable(msg.sender).transfer(msg.value - fee);
        }

        emit RandomnessRequested(_schemeId, scheme.currentCycle, sequenceNumber);
    }

    // Entropy callback - automatically called by Pyth
    function entropyCallback(uint64 sequenceNumber, address provider, bytes32 randomNumber) internal override {
        uint256 schemeId = entropyToScheme[sequenceNumber];
        uint256 cycleNum = entropyCycle[sequenceNumber];

        ChitScheme storage scheme = schemes[schemeId];
        CycleData storage cycle = cycleData[schemeId][cycleNum];

        require(cycle.bidders.length > 0, "No bidders");
        require(cycle.winner == address(0), "Winner already selected");

        // Select random winner from bidders
        uint256 winnerIndex = uint256(randomNumber) % cycle.bidders.length;
        address winner = cycle.bidders[winnerIndex];
        uint256 winningBid = cycle.bids[winner];

        cycle.winner = winner;
        cycle.winningBid = winningBid;

        users[winner].schemesWon++;
        users[winner].totalEarnings += winningBid;

        emit WinnerSelected(schemeId, cycleNum, winner, winningBid);

        // Trigger fund distribution
        _distributeFunds(schemeId, cycleNum);
    }

    // Internal function to distribute funds
    function _distributeFunds(uint256 _schemeId, uint256 _cycleNum) internal {
        ChitScheme storage scheme = schemes[_schemeId];
        CycleData storage cycle = cycleData[_schemeId][_cycleNum];

        uint256 totalPool = cycle.totalPool;
        uint256 organizerFee = (totalPool * ORGANIZER_FEE_PERCENT) / 100;
        uint256 winnerAmount = cycle.winningBid;
        uint256 dividendPool = totalPool - organizerFee - winnerAmount;

        // Transfer winner amount
        payable(cycle.winner).transfer(winnerAmount);

        // Transfer organizer fee
        payable(scheme.organizer).transfer(organizerFee);

        // Distribute dividends to other contributors
        if (dividendPool > 0 && cycle.contributors.length > 1) {
            uint256 dividendPerMember = dividendPool / (cycle.contributors.length - 1); // Exclude winner

            for (uint256 i = 0; i < cycle.contributors.length; i++) {
                address member = cycle.contributors[i];
                if (member != cycle.winner) {
                    payable(member).transfer(dividendPerMember);
                    users[member].totalEarnings += dividendPerMember;
                    emit DividendDistributed(_schemeId, _cycleNum, member, dividendPerMember);
                }
            }
        }

        cycle.isComplete = true;
    }

    // View functions
    function getScheme(uint256 _schemeId) external view returns (ChitScheme memory) {
        return schemes[_schemeId];
    }

    function getSchemeMembers(uint256 _schemeId) external view returns (address[] memory) {
        return schemes[_schemeId].members;
    }

    function getCycleInfo(
        uint256 _schemeId,
        uint256 _cycle
    )
        external
        view
        returns (uint256 totalPool, uint256 contributionsReceived, address winner, uint256 winningBid, bool isComplete)
    {
        CycleData storage cycle = cycleData[_schemeId][_cycle];
        return (cycle.totalPool, cycle.contributionsReceived, cycle.winner, cycle.winningBid, cycle.isComplete);
    }

    function getCycleBidders(uint256 _schemeId, uint256 _cycle) external view returns (address[] memory) {
        return cycleData[_schemeId][_cycle].bidders;
    }

    function getCycleContributors(uint256 _schemeId, uint256 _cycle) external view returns (address[] memory) {
        return cycleData[_schemeId][_cycle].contributors;
    }

    function getUserBid(uint256 _schemeId, uint256 _cycle, address _user) external view returns (uint256) {
        return cycleData[_schemeId][_cycle].bids[_user];
    }

    function hasUserContributed(uint256 _schemeId, uint256 _cycle, address _user) external view returns (bool) {
        return cycleData[_schemeId][_cycle].hasContributed[_user];
    }

    function hasUserBid(uint256 _schemeId, uint256 _cycle, address _user) external view returns (bool) {
        return cycleData[_schemeId][_cycle].hasBid[_user];
    }

    function getUserProfile(address _user) external view returns (UserProfile memory) {
        return users[_user];
    }

    function getCurrentCyclePeriod(uint256 _schemeId) external view returns (string memory) {
        ChitScheme storage scheme = schemes[_schemeId];
        if (!scheme.isActive || scheme.currentCycle == 0) {
            return "INACTIVE";
        }

        uint256 cycleStart = scheme.lastCycleStart;
        uint256 timeElapsed = block.timestamp - cycleStart;

        if (timeElapsed <= INVESTMENT_PERIOD) {
            return "CONTRIBUTION";
        } else if (timeElapsed <= INVESTMENT_PERIOD + BIDDING_PERIOD) {
            return "BIDDING";
        } else {
            return "SELECTION";
        }
    }

    function getRandomnessFee() external view returns (uint128) {
        return entropy.getFee(entropy.getDefaultProvider());
    }

    // Admin functions
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Fallback to receive ETH
    receive() external payable {}

    function getEntropy() internal view virtual override returns (address) {}
}

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
    mapping(address => uint256) public userSchemeCount;
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
        require(registeredSchemes[msg.sender], "Not registered scheme");

        stats.totalUsers = _totalUsers;
        stats.totalValueLocked = _totalValueLocked;
        stats.totalCompletedCycles = _completedCycles;

        emit StatsUpdated(stats.totalSchemes, stats.totalUsers, stats.totalValueLocked);
    }

    function getAllSchemes() external view returns (address[] memory) {
        return allSchemes;
    }
}

/**
 * @title ChitChainToken
 * @dev ERC20 token for governance and rewards (optional for future use)
 */
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract ChitChainToken is ERC20, ERC20Burnable, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10 ** 18; // 1B tokens

    mapping(address => bool) public minters;

    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);

    constructor() ERC20("ChitChain Token", "CHIT") {}

    function addMinter(address _minter) external onlyOwner {
        minters[_minter] = true;
        emit MinterAdded(_minter);
    }

    function removeMinter(address _minter) external onlyOwner {
        minters[_minter] = false;
        emit MinterRemoved(_minter);
    }

    function mint(address _to, uint256 _amount) external {
        require(minters[msg.sender], "Not authorized to mint");
        require(totalSupply() + _amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(_to, _amount);
    }
}

/**
 * @title ChitChainInsurance
 * @dev Insurance pool to protect against organizer defaults
 */
contract ChitChainInsurance is Ownable, ReentrancyGuard {
    struct InsurancePool {
        uint256 totalPool;
        uint256 claimsPool;
        mapping(address => uint256) contributions;
        mapping(address => bool) isCovered;
    }

    mapping(uint256 => InsurancePool) public insurancePools; // schemeId => pool
    mapping(address => bool) public authorizedSchemes;

    uint256 public constant INSURANCE_FEE_PERCENT = 1; // 1% of monthly contribution

    event InsuranceContribution(uint256 indexed schemeId, address indexed contributor, uint256 amount);
    event ClaimPaid(uint256 indexed schemeId, address indexed claimant, uint256 amount);

    modifier onlyAuthorizedScheme() {
        require(authorizedSchemes[msg.sender], "Not authorized");
        _;
    }

    function authorizeScheme(address _scheme) external onlyOwner {
        authorizedSchemes[_scheme] = true;
    }

    function contributeToInsurance(
        uint256 _schemeId,
        address _contributor
    ) external payable onlyAuthorizedScheme nonReentrant {
        InsurancePool storage pool = insurancePools[_schemeId];
        pool.contributions[_contributor] += msg.value;
        pool.totalPool += msg.value;
        pool.isCovered[_contributor] = true;

        emit InsuranceContribution(_schemeId, _contributor, msg.value);
    }

    function fileClaim(
        uint256 _schemeId,
        uint256 _amount,
        address _claimant
    ) external onlyAuthorizedScheme nonReentrant {
        InsurancePool storage pool = insurancePools[_schemeId];
        require(pool.isCovered[_claimant], "Not covered");
        require(pool.totalPool - pool.claimsPool >= _amount, "Insufficient insurance funds");

        pool.claimsPool += _amount;
        payable(_claimant).transfer(_amount);

        emit ClaimPaid(_schemeId, _claimant, _amount);
    }

    function getInsuranceInfo(
        uint256 _schemeId
    ) external view returns (uint256 totalPool, uint256 claimsPool, uint256 availableFunds) {
        InsurancePool storage pool = insurancePools[_schemeId];
        return (pool.totalPool, pool.claimsPool, pool.totalPool - pool.claimsPool);
    }
}
