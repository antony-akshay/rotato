// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

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
