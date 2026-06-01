# DoraHacks Submission — Personal CFO Agent

## Project Name
Personal CFO Agent

## Tagline
Your autonomous AI wealth manager on Mantle Network — swap, earn yield, and build on-chain reputation with a single conversation.

## Project Description (Short — 280 chars)
Personal CFO Agent is an AI-powered DeFi assistant on Mantle. It executes real token swaps via OpenOcean, finds live yield opportunities, and records every action on-chain via ERC-8004 — giving every wallet holder a verifiable financial reputation.

---

## Full Description

### The Problem

DeFi is powerful but impenetrable. Most users hold MNT in a wallet and have no idea how to put it to work. They face three barriers:

1. **Complexity** — yield protocols, DEXes, and LP strategies require deep technical knowledge
2. **Decision fatigue** — hundreds of options with no personalized guidance
3. **Trust** — no way to verify an AI agent's track record before trusting it with funds

### The Solution

Personal CFO Agent is a conversational AI that sits on top of Mantle Network and acts as a personal financial advisor. You describe what you want in plain English — the agent handles the rest.

**Just say:** *"Swap $20 of MNT to mETH"*  
The agent routes through OpenOcean DEX aggregator for best price, shows you a preview, and executes via your MetaMask wallet. No new accounts. No custodial risk. Your keys, your funds.

### Key Features

**🤖 AI Chat Agent (Gemini 2.0 Flash)**
Real-time streaming responses with full Mantle DeFi context. Knows current mETH APR, Lendle rates, Merchant Moe LP pools, and Agni Finance. Falls back to a smart rule-based system if API is rate-limited — it never goes offline.

**💱 Real Token Swaps**
Powered by OpenOcean v3 DEX aggregator — best price routing across all Mantle liquidity sources. Supports MNT, USDC, USDT, WETH, mETH, WMNT. Slippage protection, gas estimation, and fee transparency included.

**🌾 Live Yield Data**
Real APR from Mantle LSP API (mETH staking) and Lendle lending protocol. No hardcoded numbers — if yields change, the agent updates its recommendations.

**🏆 On-chain Reputation (ERC-8004)**
Every user mints a unique Agent NFT on their first swap. The `PersonalCFOAgentRegistry` contract on Mantle mainnet records intent hashes and execution counts permanently. This creates a verifiable, tamper-proof reputation score — the longer you use the agent, the higher your trust tier (Newcomer → Active → Trusted → Elite).

Contract: `0x33b0BF3eCac3A9142065C57B8F8E9C5368e114e5` · Verified on Sourcify

**⚡ Autonomous Mode**
Toggle to let the AI proactively monitor your portfolio. Every 2 minutes it checks live prices and risk conditions, then proposes specific swaps with rationale. You approve or reject — the agent never moves funds without your explicit MetaMask signature.

**🔔 Price Alerts**
Browser push notifications fire automatically when MNT moves 3%+. Works even when the tab is in the background. First DeFi app on Mantle with native OS-level price notifications.

**🧮 What-if Simulation**
Test any reallocation before committing. "What if I put 50% into mETH?" — see the projected APR and USD impact instantly.

**📚 Learn Tab**
Guided DeFi education covering: what swapping is, how yield works, what LP means, and how to manage risk. Designed for users coming from TradFi who have never touched DeFi.

**👥 Referral System**
Every user gets a unique referral URL. Referred users get a fee discount (0.15% → 0.10%). Simple viral loop built into the core product.

### Technical Architecture

- **Frontend:** Next.js 16 App Router, TypeScript, Tailwind CSS
- **UI Design:** Bloomberg Terminal aesthetic — dark, data-dense, professional
- **AI:** Google Gemini 2.0 Flash via streaming SSE with smart fallback
- **Swaps:** OpenOcean v3 REST API → MetaMask signing (no custodial risk)
- **Prices:** CoinGecko API + Mantle RPC balance queries
- **Yield:** Mantle LSP API (mETH) + Lendle subgraph
- **Chain:** Mantle Mainnet (chainId 5000)
- **Smart Contract:** Solidity, ERC-721 + ERC-8004 extension, Hardhat deploy
- **Hosting:** Vercel (zero cold starts, global CDN)

### Why Mantle?

Mantle's low gas fees make micro-interactions economical. A $5 swap with a 0.15% fee ($0.0075) would be wiped out on Ethereum mainnet by gas alone. On Mantle, it's trivially cheap. This enables use cases — frequent small swaps, yield compounding, reputation building — that simply don't work on L1.

mETH is the perfect "first yield" for new users: hold it, earn 4-6% APR automatically, no impermanent loss. The agent recommends it first for conservative risk profiles.

### What's Live Today

- ✅ Deployed on Vercel: https://personal-cfo-agent.vercel.app
- ✅ Smart contract live on Mantle mainnet (verified on Sourcify)
- ✅ Real swaps execute via OpenOcean (tested and working)
- ✅ Real mETH yield data from Mantle LSP API
- ✅ Real-time MNT/ETH/USDC prices from CoinGecko
- ✅ Autonomous mode with AI-initiated proposals
- ✅ Browser push notifications for price alerts
- ✅ On-chain reputation NFT minting on swap

### Team

Solo builder — full-stack development, smart contract, AI integration, UI/UX design.

### Links

- **Live App:** https://personal-cfo-agent.vercel.app
- **Demo Video:** https://youtu.be/Ifi11L_I2Tw
- **GitHub:** https://github.com/Osiyomeoh/cfo
- **Contract:** https://mantlescan.xyz/address/0x33b0BF3eCac3A9142065C57B8F8E9C5368e114e5
- **Sourcify:** https://repo.sourcify.dev/contracts/full_match/5000/0x33b0BF3eCac3A9142065C57B8F8E9C5368e114e5/

---

## Judging Criteria Alignment

### Innovation / Creativity
ERC-8004 on-chain agent reputation is novel. No other DeFi assistant on Mantle builds a verifiable track record for AI decisions. The combination of autonomous proposals + user approval + on-chain anchoring is a new pattern for trustworthy AI agents in DeFi.

### Technical Execution
- Real smart contract on mainnet (not testnet)
- Real swaps (not simulated) via production OpenOcean API
- Real yield data from live APIs
- Streaming AI with graceful degradation
- TypeScript end-to-end, no security shortcuts

### User Experience
- Bloomberg Terminal aesthetic — judges who know DeFi will immediately recognize the professionalism
- Conversational onboarding — no docs needed, just type what you want
- Learn tab — judges who don't know DeFi can get up to speed in 5 minutes
- "Get MNT" button — solves the cold-start problem for new users

### Mantle Ecosystem Impact
- Drives volume to OpenOcean (and underlying Mantle DEXes)
- Drives TVL to mETH staking and Lendle lending
- Referral system creates viral growth on Mantle
- On-chain reputation creates a reason to stay on Mantle

### Completeness
Fully working product, not a prototype. Deployed, tested, with real mainnet transactions.
