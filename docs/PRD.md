# PRODUCT REQUIREMENTS DOCUMENT
## Personal CFO Agent
### Autonomous On-Chain Wealth Management for Everyone

**v1.0** · Turing Test Hackathon 2026 · Mantle Network

| Field | Value |
|-------|-------|
| Product | Personal CFO Agent |
| Version | 1.0 — Hackathon MVP |
| Track | Agentic Economy (Byreal) + Best UI/UX Award |
| Target Chain | Mantle Network |
| Date | 25 May 2026 |
| Status | In Build — MVP scaffold + on-chain hooks |

---

## 1. Executive Summary

Personal CFO Agent is an autonomous, conversational AI agent that manages on-chain wealth for users with zero DeFi expertise. It bridges the gap between the complexity of decentralized finance and the billions of people globally who lack access to traditional financial advisors — particularly across Africa, Southeast Asia, and Latin America.

> "We are building the autonomous on-chain wealth manager for the next billion users that traditional finance forgot."

The agent accepts natural-language instructions, executes trades and LP positions autonomously via the Byreal Skills CLI on Mantle, maintains a live portfolio dashboard, and builds a permanent on-chain reputation via the ERC-8004 agent identity standard — creating a verifiable track record that grows in value over time.

---

## 2. Problem Statement

### 2.1 The Wealth Management Gap

- Over 1.4 billion adults globally remain unbanked or underbanked
- DeFi offers superior yields and accessibility but requires deep technical knowledge
- Existing crypto interfaces assume users understand liquidity pools, slippage, gas, and perpetual futures
- The next 500 million crypto users are not degens — they are ordinary people who want yield without complexity

### 2.2 The On-Chain Opportunity

Mantle's ecosystem and Byreal's agent infrastructure enable autonomous agents with on-chain execution, verifiable identity (ERC-8004), RWA access (mETH, USDY, fBTC), and tamper-proof decision records.

---

## 3. Goals & Success Metrics

### Hackathon Goals

- Win First Prize — Agentic Economy track
- Win Best UI/UX Award
- Claim 20 Project Deployment Award (early deploy)
- Position for post-hackathon investment

| Metric | Hackathon Target | 6-Month Target |
|--------|------------------|----------------|
| Agent Execution Success Rate | > 90% | > 99% |
| Time from instruction to execution | < 30s | < 10s |
| Unique users (demo) | 50+ | 10,000+ |
| On-chain transactions | 100+ | 1M+ |

---

## 4. User Personas

**Persona A — The Newcomer (Amara, Lagos):** Stablecoin savings, no DeFi knowledge. Goal: grow savings, get notified on changes.

**Persona B — The Sophisticated User (David, London):** Active DeFi, 8 positions across 3 chains. Goal: set strategy once, audit every move.

---

## 5. Product Architecture

| Layer | Component | Responsibility |
|-------|-----------|----------------|
| Presentation | React Frontend | Chat, dashboard, action feed, onboarding |
| Intelligence | LLM Agent Core | NL understanding, strategy, self-correction |
| Execution | Byreal Skills CLI | Swap, LP, perps on Mantle |
| Data & Identity | Mantle / ERC-8004 | On-chain records, agent NFT, performance history |

**Stack:** React + Tailwind · Claude/GPT-4 · Byreal Skills + Perps CLI · Mantle · ERC-8004 · Nansen (signals) · Node/Express orchestration

---

## 6. Feature Requirements (MVP)

| # | Feature | Priority |
|---|---------|----------|
| F-01 | Conversational Interface | P0 |
| F-02 | Agent Execution Engine | P0 |
| F-03 | Portfolio Dashboard | P0 |
| F-04 | Agent Action Feed | P0 |
| F-05 | ERC-8004 Identity | P0 |
| F-06 | Onboarding Flow (5 steps) | P1 |
| F-07 | Risk Profile System | P1 |
| F-08 | Smart Alerts | P1 |
| F-09 | Strategy Templates | P2 |
| F-10 | Social Sharing | P2 |

---

## 7. Core User Flows

1. **First-time:** Hero → wallet → risk quiz → agent intro → fund → first tx on dashboard
2. **Ongoing:** NL instruction → parse → preview → confirm/auto-execute → tx logged → ERC-8004 updated
3. **Self-correction:** Monitor every 15 min → yield threshold → rebalance → action feed rationale

---

## 8. Build Roadmap

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Week 1 | Days 1–7 | Byreal CLI, execution engine, chat, wallet |
| Week 2 | Days 8–14 | Dashboard polish, onboarding, risk profile |
| Week 3 | Days 15–21 | Mainnet deploy, ERC-8004, demo video, submission |

**Deploy Mantle Testnet by Day 10** for 20 Project Deployment Award.

---

## 9. Hackathon Winning Strategy

**Awards:** Agentic Economy (~$15k) · Best UI/UX (~$5–10k) · 20 Project Deployment

**Judging:** Byreal depth (35%) · Autonomy (25%) · Technical completeness (20%) · Sustainability (20%)

**Differentiation:** Built for non-DeFi users · Personal CFO framing · Solo UI polish · ERC-8004 narrative

---

## 10. Long-Term Vision

Layer 1 MVP → Layer 2 Personal Finance OS → Layer 3 Multi-chain/RWA → Layer 4 Agent marketplace → Layer 5 B2B SDK

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Byreal CLI instability | Mock execution fallback; daily testnet |
| Solo bandwidth | Ruthless P0 priority |
| Smart contract bug | Testnet until final 48h |
| UI polish | Week 2 design focus |
| Community voting | X post Day 18 |

---

*Personal CFO Agent · Turing Test Hackathon 2026 · Built on Mantle · Confidential — Draft v1.0*
