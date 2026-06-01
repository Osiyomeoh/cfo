import { ethers } from 'hardhat'

const MIN_BALANCE_WEI = ethers.parseEther('0.05')

function normalizeKey(key: string | undefined): string | undefined {
  if (!key?.trim()) return undefined
  const t = key.trim()
  return t.startsWith('0x') ? t : `0x${t}`
}

async function main() {
  const [deployer] = await ethers.getSigners()
  const execKey = normalizeKey(process.env.EXECUTOR_PRIVATE_KEY)
  const relayer = execKey
    ? new ethers.Wallet(execKey).address
    : deployer.address

  const balance = await ethers.provider.getBalance(deployer.address)
  console.log('Network:', (await ethers.provider.getNetwork()).name, 'chainId', (await ethers.provider.getNetwork()).chainId)
  console.log('Deployer:', deployer.address)
  console.log('Balance:', ethers.formatEther(balance), 'MNT')
  console.log('Relayer:', relayer)

  if (balance < MIN_BALANCE_WEI) {
    console.error('')
    console.error('Insufficient MNT on Mantle Sepolia for deployment.')
    console.error(`Need at least ${ethers.formatEther(MIN_BALANCE_WEI)} MNT, have ${ethers.formatEther(balance)} MNT.`)
    console.error('')
    console.error('1. Open https://faucet.sepolia.mantle.xyz/')
    console.error('2. Connect the SAME wallet as DEPLOYER_PRIVATE_KEY')
    console.error(`   → ${deployer.address}`)
    console.error('3. Mint testnet MNT, wait for confirmation')
    console.error('4. Re-run: npm run deploy:registry')
    console.error('')
    console.error('Explorer: https://sepolia.mantlescan.xyz/address/' + deployer.address)
    process.exit(1)
  }

  console.log('Deploying PersonalCFOAgentRegistry…')
  const Registry = await ethers.getContractFactory('PersonalCFOAgentRegistry')
  const registry = await Registry.deploy(relayer)
  await registry.waitForDeployment()
  const address = await registry.getAddress()

  console.log('')
  console.log('PersonalCFOAgentRegistry deployed:', address)
  console.log('Execution relayer:', relayer)
  console.log('View contract: https://sepolia.mantlescan.xyz/address/' + address)
  console.log('')
  console.log('Add to .env.local:')
  console.log(`NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS=${address}`)
  console.log(`IDENTITY_REGISTRY_ADDRESS=${address}`)
  if (!process.env.EXECUTOR_PRIVATE_KEY) {
    console.log('EXECUTOR_PRIVATE_KEY=<same as DEPLOYER_PRIVATE_KEY for hackathon MVP>')
  }
  console.log('EXECUTION_MOCK_MODE=false')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
