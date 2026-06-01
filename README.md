# Personal CFO Agent

> Autonomous on-chain wealth manager — Turing Test Hackathon 2026 · Mantle Network

**Live demo:** https://personal-cfo-agent.vercel.app  
**Demo video:** https://youtu.be/Ifi11L_I2Tw  
**Contract:** [`0x33b0BF3eCac3A9142065C57B8F8E9C5368e114e5`](https://mantlescan.xyz/address/0x33b0BF3eCac3A9142065C57B8F8E9C5368e114e5) · Mantle Mainnet · [Verified on Sourcify](https://repo.sourcify.dev/contracts/full_match/5000/0x33b0BF3eCac3A9142065C57B8F8E9C5368e114e5/)

---

## What it does

Personal CFO Agent is an autonomous AI agent that manages a user's on-chain portfolio on Mantle Network. It combines a Bloomberg Terminal-style dashboard with a conversational AI interface powered by Google Gemini — giving every wallet holder a personal financial advisor that never sleeps.

**Every agent action is anchored permanently on-chain** via the ERC-8004 agent identity standard — creating a verifiable, tamper-proof execution history that builds reputation over time.

---

## Core Features

| Feature | Detail |
|---------|--------|
| 🤖 **AI Chat Agent** | Gemini 2.0 Flash with streaming SSE, context-aware portfolio advice |
| 💱 **Token Swaps** | Execute MNT/USDC/USDT/WETH/mETH swaps via OpenOcean DEX aggregator |
| 🌾 **Real Yield Data** | Live mETH APR from Mantle LSP API, live Lendle rates |
| 📊 **Live Portfolio** | Real-time wallet balances via Mantle RPC, USD pricing from CoinGecko |
| 🏆 **On-chain Reputation** | ERC-8004 agent NFT records every execution on Mantle mainnet |
| ⚡ **Autonomous Mode** | AI-initiated swap proposals every 2 min based on live market data |
| 🔔 **Price Alerts** | Browser push notifications on 3%+ MNT price moves |
| 🧮 **What-if Simulation** | Simulate portfolio reallocation before committing |
| 📚 **Learn Tab** | Guided DeFi education: yields, LP, risk management |
| 👥 **Referral System** | Shareable referral URL with fee discount (0.15% → 0.10%) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 16 App Router                 │
│                                                         │
│  ┌──────────────┐   ┌──────────────┐   ┌─────────────┐ │
│  │  Bloomberg   │   │  Gemini AI   │   │  MetaMask   │ │
│  │  Terminal UI │   │  Streaming   │   │  Wallet     │ │
│  │  (pro.css)   │   │  Chat (SSE)  │   │  (ethers)   │ │
│  └──────────────┘   └──────────────┘   └─────────────┘ │
│                                                         │
│  ┌──────────────┐   ┌──────────────┐   ┌─────────────┐ │
│  │  OpenOcean   │   │  Mantle LSP  │   │  ERC-8004   │ │
│  │  DEX Aggr.   │   │  Yield API   │   │  Registry   │ │
│  │  (swaps)     │   │  (mETH APR)  │   │  (on-chain) │ │
│  └──────────────┘   └──────────────┘   └─────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Chain:** Mantle Mainnet (chainId 5000)  
**AI Model:** Google Gemini 2.0 Flash  
**Swap Router:** OpenOcean v3 DEX Aggregator  
**Agent Identity:** ERC-8004 (ERC-721 extension)

---

## Smart Contract

The `PersonalCFOAgentRegistry` contract is deployed on **Mantle Mainnet**:

- **Address:** `0x33b0BF3eCac3A9142065C57B8F8E9C5368e114e5`
- **Explorer:** [mantlescan.xyz](https://mantlescan.xyz/address/0x33b0BF3eCac3A9142065C57B8F8E9C5368e114e5)
- **Verified:** [Sourcify full match](https://repo.sourcify.dev/contracts/full_match/5000/0x33b0BF3eCac3A9142065C57B8F8E9C5368e114e5/)
- **Standard:** ERC-8004 (agent identity NFT)

### What the contract does

Each user mints a unique Agent NFT on first swap. The agent records:
- `intentCount` — total intents anchored
- `okActions` — successful on-chain actions
- On-chain event log: `AgentIntent(agentId, intentHash, timestamp)`

This creates an **immutable reputation score** — higher executions = higher trust.

---

## Quick Start

### Prerequisites

- Node.js 20+
- MetaMask with Mantle Mainnet added
- Free API keys: [Gemini](https://aistudio.google.com) · [CoinGecko](https://coingecko.com/api)

### Install

```bash
git clone https://github.com/Osiyomeoh/cfo
cd personal-cfo-agent
npm install
```

### Configure

Create `.env.local`:

```env
GEMINI_API_KEY=your_gemini_api_key
COINGECKO_API_KEY=your_coingecko_api_key   # optional, improves price reliability
MNT_USD_PRICE=0.70                          # fallback if CoinGecko unavailable
FEE_WALLET_ADDRESS=0xYourFeeWalletAddress   # receives 0.15% swap fee
```

### Run

```bash
npm run dev
# → http://localhost:3000
```

---

## How Swaps Work

1. User types: *"Swap $10 of MNT to USDC"*
2. AI parses intent, generates a transaction preview
3. Backend fetches best route from OpenOcean DEX aggregator
4. User reviews preview (tokens, amounts, slippage, fee)
5. User clicks **Confirm** → MetaMask opens
6. User signs → swap executes on Mantle
7. Agent NFT records the intent on-chain

**Your keys, your swap.** The backend never holds private keys. All transactions are signed by the user's MetaMask wallet.

---

## Fee Structure

| User Type | Fee | How |
|-----------|-----|-----|
| Standard | 0.15% | Applied automatically |
| Referred | 0.10% | Share your referral URL |

Fee is a separate MNT transfer sent to the fee wallet before the swap executes.

---

## On-chain Reputation System

Each wallet's Agent NFT accumulates a reputation score:

```
Score = min(100, executions × 8 + okActions × 5)
```

| Score | Tier |
|-------|------|
| 0–24 | Newcomer |
| 25–49 | Active |
| 50–74 | Trusted |
| 75–100 | Elite |

Scores are calculated from on-chain event data — fully verifiable, impossible to fake.

---

## Project Structure

```
app/
  api/
    agent/route.ts       # Gemini AI chat endpoint (SSE streaming)
    swap/quote/route.ts  # OpenOcean swap quote + fee calculation
    yields/route.ts      # Real yield data (mETH, Lendle)
    prices/route.ts      # Live token prices
  page.tsx               # Dashboard shell
components/
  agent/                 # Chat, AutonomyPanel
  portfolio/             # PortfolioCard, PositionsView, GetMntButton
  views/                 # LearnView, ReputationView, AnalyticsView
  layout/                # SideNav, PriceTicker
context/
  AgentProvider.tsx      # Global state, wallet, swap execution
contracts/
  PersonalCFOAgentRegistry.sol  # ERC-8004 agent identity
lib/
  portfolio.ts           # Wallet balance fetching
  referral.ts            # Referral code generation
  agent/
    intent.ts            # Chat intent parsing
    executor.ts          # Transaction preview builder
```

---

## Hackathon

Built for **Turing Test Hackathon 2026** — Mantle Network track.

### Highlights

- Real token swaps on Mantle mainnet via OpenOcean DEX aggregator
- Live yield data sourced directly from Mantle LSP API and Lendle protocol
- On-chain agent NFT with verifiable execution history (ERC-8004)
- Autonomous AI proposals triggered by live market conditions
- Browser push notifications for significant price movements
- Bloomberg Terminal-inspired UI designed for clarity and speed
- Built-in DeFi education (Learn tab) for users new to on-chain finance
- Referral system with fee discounts for referred users

---

## License

MIT
