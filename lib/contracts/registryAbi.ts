export const REGISTRY_ABI = [
  // ── Write ──
  'function registerAgent(string agentURI) returns (uint256)',
  'function recordExecution(uint256 agentId, bytes32 actionHash, string actionType, uint256 amountCents)',
  'function pauseAgent(uint256 agentId)',
  'function unpauseAgent(uint256 agentId)',
  'function setExecutionRelayer(address relayer)',
  'function setMaxExecutionValueCents(uint256 capCents)',
  'function pause()',
  'function unpause()',

  // ── Read ──
  'function agentIdByWallet(address wallet) view returns (uint256)',
  'function records(uint256 agentId) view returns (uint256 executions, bytes32 lastActionHash, uint256 lastUpdated, uint256 dailyCount, uint256 dailyWindowStart, bool paused)',
  'function reputationScore(uint256 agentId) view returns (uint256)',
  'function remainingDailyExecutions(uint256 agentId) view returns (uint256)',
  'function isActiveAgent(uint256 agentId) view returns (bool)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function executionRelayer() view returns (address)',
  'function maxExecutionValueCents() view returns (uint256)',

  // ── Events ──
  'event AgentRegistered(uint256 indexed agentId, address indexed owner, string agentURI)',
  'event ExecutionRecorded(uint256 indexed agentId, bytes32 indexed actionHash, string actionType, uint256 amountCents, uint256 totalExecutions)',
  'event AgentPaused(uint256 indexed agentId, address by)',
  'event AgentUnpaused(uint256 indexed agentId, address by)',
  'event RelayerUpdated(address indexed oldRelayer, address indexed newRelayer)',

  // ── Errors ──
  'error AlreadyRegistered()',
  'error InvalidAgent()',
  'error NotAuthorized()',
  'error URITooLong()',
  'error AgentIsPaused()',
  'error DailyRateLimitExceeded()',
  'error ExceedsSpendCap(uint256 amountCents, uint256 capCents)',
  'error ZeroAddress()',
  'error DuplicateAction(bytes32 actionHash)',
] as const

export function registryAddress(): string | null {
  return (
    process.env.IDENTITY_REGISTRY_ADDRESS
    || process.env.NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS
    || null
  )
}
