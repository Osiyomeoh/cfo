import { config as loadEnv } from 'dotenv'
import { existsSync } from 'fs'
import { resolve } from 'path'
import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-ethers'
import '@nomicfoundation/hardhat-chai-matchers'
import '@nomicfoundation/hardhat-verify'

// Next.js reads .env.local; Hardhat does not unless we load it explicitly
if (existsSync(resolve(process.cwd(), '.env.local'))) {
  loadEnv({ path: resolve(process.cwd(), '.env.local') })
}
loadEnv()

function normalizeKey(key: string | undefined): string | undefined {
  if (!key?.trim()) return undefined
  const t = key.trim()
  return t.startsWith('0x') ? t : `0x${t}`
}

const deployerKey =
  normalizeKey(process.env.DEPLOYER_PRIVATE_KEY)
  || normalizeKey(process.env.PRIVATE_KEY)
  || '0x0000000000000000000000000000000000000000000000000000000000000001'

if (!normalizeKey(process.env.DEPLOYER_PRIVATE_KEY) && !normalizeKey(process.env.PRIVATE_KEY)) {
  console.warn(
    '[hardhat] DEPLOYER_PRIVATE_KEY not loaded — using dummy account. Put keys in .env.local',
  )
}

const config: HardhatUserConfig = {
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  solidity: {
    version: '0.8.24',
    settings: {
      // OpenZeppelin v5.2+ uses mcopy (requires Cancun EVM)
      evmVersion: 'cancun',
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    mantleSepolia: {
      url: process.env.MANTLE_TESTNET_RPC_URL || 'https://rpc.sepolia.mantle.xyz',
      chainId: 5003,
      accounts: [deployerKey],
    },
    mantle: {
      url: process.env.MANTLE_RPC_URL || 'https://rpc.mantle.xyz',
      chainId: 5000,
      accounts: deployerKey.startsWith('0x0000') ? [] : [deployerKey],
    },
  },
  sourcify: {
    enabled: true,
  },
  etherscan: {
    apiKey: {
      mantleSepolia: process.env.MANTLESCAN_API_KEY || 'placeholder',
      mantle: process.env.MANTLESCAN_API_KEY || 'placeholder',
    },
    customChains: [
      {
        network: 'mantleSepolia',
        chainId: 5003,
        urls: {
          apiURL: 'https://api-sepolia.mantlescan.xyz/api',
          browserURL: 'https://sepolia.mantlescan.xyz',
        },
      },
      {
        network: 'mantle',
        chainId: 5000,
        urls: {
          apiURL: 'https://api.mantlescan.xyz/api',
          browserURL: 'https://explorer.mantle.xyz',
        },
      },
    ],
  },
}

export default config
