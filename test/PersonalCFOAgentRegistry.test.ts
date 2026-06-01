import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('PersonalCFOAgentRegistry', () => {
  const AGENT_URI = 'data:application/json;base64,eyJuYW1lIjoiUGVyc29uYWwgQ0ZPIn0='

  async function deployFixture() {
    const [owner, user, relayer, stranger] = await ethers.getSigners()
    const Registry = await ethers.getContractFactory('PersonalCFOAgentRegistry')
    const registry = await Registry.deploy(relayer.address)
    await registry.waitForDeployment()
    return { registry, owner, user, relayer, stranger }
  }

  it('deploys with relayer and owner', async () => {
    const { registry, relayer, owner } = await deployFixture()
    expect(await registry.executionRelayer()).to.equal(relayer.address)
    expect(await registry.owner()).to.equal(owner.address)
    expect(await registry.name()).to.equal('Personal CFO Agent')
    expect(await registry.symbol()).to.equal('PCFO')
  })

  it('registers agent NFT for wallet', async () => {
    const { registry, user } = await deployFixture()
    await expect(registry.connect(user).registerAgent(AGENT_URI))
      .to.emit(registry, 'AgentRegistered')
      .withArgs(1, user.address, AGENT_URI)

    expect(await registry.ownerOf(1)).to.equal(user.address)
    expect(await registry.agentIdByWallet(user.address)).to.equal(1)
    expect(await registry.tokenURI(1)).to.equal(AGENT_URI)
    expect(await registry.reputationScore(1)).to.equal(0)
  })

  it('rejects duplicate registration', async () => {
    const { registry, user } = await deployFixture()
    await registry.connect(user).registerAgent(AGENT_URI)
    await expect(registry.connect(user).registerAgent(AGENT_URI)).to.be.revertedWith(
      'already registered',
    )
  })

  it('records execution from relayer and updates reputation', async () => {
    const { registry, user, relayer } = await deployFixture()
    await registry.connect(user).registerAgent(AGENT_URI)

    const actionHash = ethers.keccak256(ethers.toUtf8Bytes('lp_open:preview-1'))
    await expect(
      registry.connect(relayer).recordExecution(1, actionHash, 'lp_open'),
    )
      .to.emit(registry, 'ExecutionRecorded')
      .withArgs(1, actionHash, 'lp_open', 1)

    const rec = await registry.records(1)
    expect(rec.executions).to.equal(1)
    expect(rec.lastActionHash).to.equal(actionHash)
    expect(await registry.reputationScore(1)).to.equal(51)
  })

  it('allows owner to record execution', async () => {
    const { registry, user } = await deployFixture()
    await registry.connect(user).registerAgent(AGENT_URI)
    const hash = ethers.keccak256(ethers.toUtf8Bytes('swap'))
    await registry.connect(user).recordExecution(1, hash, 'swap')
    expect(await registry.reputationScore(1)).to.equal(51)
  })

  it('rejects unauthorized recordExecution', async () => {
    const { registry, user, stranger } = await deployFixture()
    await registry.connect(user).registerAgent(AGENT_URI)
    const hash = ethers.keccak256(ethers.toUtf8Bytes('x'))
    await expect(
      registry.connect(stranger).recordExecution(1, hash, 'swap'),
    ).to.be.revertedWith('not authorized')
  })

  it('caps reputation at 100', async () => {
    const { registry, user, relayer } = await deployFixture()
    await registry.connect(user).registerAgent(AGENT_URI)
    for (let i = 0; i < 60; i++) {
      const h = ethers.keccak256(ethers.toUtf8Bytes(`exec-${i}`))
      await registry.connect(relayer).recordExecution(1, h, 'rebalance')
    }
    expect(await registry.reputationScore(1)).to.equal(100)
    const rec = await registry.records(1)
    expect(rec.executions).to.equal(60)
  })

  it('owner can update execution relayer', async () => {
    const { registry, owner, user, relayer, stranger } = await deployFixture()
    await registry.connect(owner).setExecutionRelayer(stranger.address)
    expect(await registry.executionRelayer()).to.equal(stranger.address)

    await registry.connect(user).registerAgent(AGENT_URI)
    const hash = ethers.keccak256(ethers.toUtf8Bytes('y'))
    await registry.connect(stranger).recordExecution(1, hash, 'compound')
    expect(await registry.reputationScore(1)).to.equal(51)

    await expect(
      registry.connect(relayer).recordExecution(1, hash, 'compound'),
    ).to.be.revertedWith('not authorized')
  })
})
