// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/// @title ERC-8004-style agent identity for Personal CFO — hardened for mainnet
/// @notice Mints agent NFTs and records execution history on Mantle
/// @dev Security: reentrancy guard, pausable, input validation, rate limiting, spend cap
contract PersonalCFOAgentRegistry is ERC721URIStorage, Ownable, ReentrancyGuard, Pausable {

    // ─── State ───────────────────────────────────────────────────────────────

    uint256 private _nextAgentId = 1;
    address public executionRelayer;

    /// @dev Max URI length to prevent calldata bloat / DoS
    uint256 public constant MAX_URI_LENGTH = 4096;

    /// @dev Rate limit: max executions recorded per agent per day
    uint256 public constant MAX_EXECUTIONS_PER_DAY = 100;

    /// @dev Max USD value (in cents) that can be recorded per execution — protects against runaway agent
    uint256 public maxExecutionValueCents = 100_000_00; // $100,000 default cap

    struct AgentRecord {
        uint256 executions;
        bytes32 lastActionHash;
        uint256 lastUpdated;
        uint256 dailyCount;       // executions today
        uint256 dailyWindowStart; // timestamp of current day window
        bool    paused;           // per-agent emergency pause
    }

    mapping(uint256 => AgentRecord) public records;
    mapping(address => uint256)     public agentIdByWallet;

    // ─── Events ───────────────────────────────────────────────────────────────

    event AgentRegistered(uint256 indexed agentId, address indexed owner, string agentURI);
    event ExecutionRecorded(
        uint256 indexed agentId,
        bytes32 indexed actionHash,
        string  actionType,
        uint256 amountCents,
        uint256 totalExecutions
    );
    event AgentPaused(uint256 indexed agentId, address by);
    event AgentUnpaused(uint256 indexed agentId, address by);
    event RelayerUpdated(address indexed oldRelayer, address indexed newRelayer);
    event SpendCapUpdated(uint256 newCapCents);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error AlreadyRegistered();
    error InvalidAgent();
    error NotAuthorized();
    error URITooLong();
    error AgentIsPaused();
    error DailyRateLimitExceeded();
    error ExceedsSpendCap(uint256 amountCents, uint256 capCents);
    error ZeroAddress();
    error DuplicateAction(bytes32 actionHash);

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(address relayer) ERC721("Personal CFO Agent", "PCFO") Ownable(msg.sender) {
        if (relayer == address(0)) revert ZeroAddress();
        executionRelayer = relayer;
    }

    // ─── Owner admin ─────────────────────────────────────────────────────────

    function setExecutionRelayer(address relayer) external onlyOwner {
        if (relayer == address(0)) revert ZeroAddress();
        emit RelayerUpdated(executionRelayer, relayer);
        executionRelayer = relayer;
    }

    function setMaxExecutionValueCents(uint256 capCents) external onlyOwner {
        maxExecutionValueCents = capCents;
        emit SpendCapUpdated(capCents);
    }

    /// @notice Emergency pause all minting and execution recording
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    /// @notice Per-agent emergency pause (owner or agent owner)
    function pauseAgent(uint256 agentId) external {
        if (_ownerOf(agentId) == address(0)) revert InvalidAgent();
        if (msg.sender != owner() && msg.sender != _ownerOf(agentId)) revert NotAuthorized();
        records[agentId].paused = true;
        emit AgentPaused(agentId, msg.sender);
    }

    function unpauseAgent(uint256 agentId) external {
        if (_ownerOf(agentId) == address(0)) revert InvalidAgent();
        if (msg.sender != owner() && msg.sender != _ownerOf(agentId)) revert NotAuthorized();
        records[agentId].paused = false;
        emit AgentUnpaused(agentId, msg.sender);
    }

    // ─── Core functions ───────────────────────────────────────────────────────

    /// @notice Mint agent identity NFT to caller (ERC-8004 pattern)
    /// @param agentURI  JSON metadata URI (data: or https:)
    function registerAgent(string calldata agentURI)
        external
        nonReentrant
        whenNotPaused
        returns (uint256 agentId)
    {
        if (agentIdByWallet[msg.sender] != 0) revert AlreadyRegistered();
        if (bytes(agentURI).length > MAX_URI_LENGTH)  revert URITooLong();

        agentId = _nextAgentId++;
        _safeMint(msg.sender, agentId);
        _setTokenURI(agentId, agentURI);
        agentIdByWallet[msg.sender] = agentId;

        records[agentId] = AgentRecord({
            executions: 0,
            lastActionHash: bytes32(0),
            lastUpdated: block.timestamp,
            dailyCount: 0,
            dailyWindowStart: block.timestamp,
            paused: false
        });

        emit AgentRegistered(agentId, msg.sender, agentURI);
    }

    /// @notice Record an on-chain agent execution
    /// @param agentId      The agent NFT token ID
    /// @param actionHash   keccak256 of (previewId : actionType : txHash) — prevents duplicates
    /// @param actionType   Human-readable action string e.g. "swap", "lp_open"
    /// @param amountCents  USD value in cents (0 if unknown) — checked against spend cap
    function recordExecution(
        uint256 agentId,
        bytes32 actionHash,
        string calldata actionType,
        uint256 amountCents
    )
        external
        nonReentrant
        whenNotPaused
    {
        // ── Auth ──
        if (_ownerOf(agentId) == address(0)) revert InvalidAgent();
        if (msg.sender != _ownerOf(agentId) && msg.sender != executionRelayer) revert NotAuthorized();

        AgentRecord storage r = records[agentId];

        // ── Per-agent pause ──
        if (r.paused) revert AgentIsPaused();

        // ── Duplicate action guard ──
        if (r.lastActionHash == actionHash && actionHash != bytes32(0)) revert DuplicateAction(actionHash);

        // ── Spend cap ──
        if (amountCents > maxExecutionValueCents) revert ExceedsSpendCap(amountCents, maxExecutionValueCents);

        // ── Daily rate limit ──
        if (block.timestamp >= r.dailyWindowStart + 1 days) {
            // New day — reset window
            r.dailyCount = 0;
            r.dailyWindowStart = block.timestamp;
        }
        if (r.dailyCount >= MAX_EXECUTIONS_PER_DAY) revert DailyRateLimitExceeded();

        // ── Record ──
        r.executions       += 1;
        r.dailyCount       += 1;
        r.lastActionHash    = actionHash;
        r.lastUpdated       = block.timestamp;

        emit ExecutionRecorded(agentId, actionHash, actionType, amountCents, r.executions);
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    /// @notice Reputation score 0–100 based on execution count
    function reputationScore(uint256 agentId) external view returns (uint256) {
        uint256 n = records[agentId].executions;
        if (n == 0) return 0;
        uint256 score = 50 + n;
        return score > 100 ? 100 : score;
    }

    /// @notice Check if agent is within daily rate limit
    function remainingDailyExecutions(uint256 agentId) external view returns (uint256) {
        AgentRecord storage r = records[agentId];
        if (block.timestamp >= r.dailyWindowStart + 1 days) return MAX_EXECUTIONS_PER_DAY;
        if (r.dailyCount >= MAX_EXECUTIONS_PER_DAY) return 0;
        return MAX_EXECUTIONS_PER_DAY - r.dailyCount;
    }

    /// @notice True if agentId exists and is not paused
    function isActiveAgent(uint256 agentId) external view returns (bool) {
        return _ownerOf(agentId) != address(0) && !records[agentId].paused;
    }
}
