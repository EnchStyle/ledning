# XRP Ledger (XRPL) Features and Capabilities - 2024

## Important: No Smart Contracts on XRPL
The XRP Ledger **does NOT have smart contracts**. This is a deliberate design choice to prioritize security and stability through simplicity. The XRPL is a "fixed-function ledger" that offers built-in features instead of programmable contracts.

## Core XRPL Features

### 1. Native DEX (Decentralized Exchange)
- Built-in central limit order book (CLOB)
- Automated Market Maker (AMM) functionality
- Multi-currency exchange built directly into the blockchain
- No smart contracts needed

### 2. Tokens and Issued Currencies
- Native support for custom tokens/issued currencies
- Multi-Purpose Tokens (MPTs) - introduced in v2.3.0 (2024)
- No smart contracts required for token creation

### 3. NFTs (Non-Fungible Tokens)
- Native NFT support (XLS-20 standard)
- Built into the core protocol
- Includes royalties and anti-spam features
- No smart contracts needed

### 4. Escrow
- Conditional payments with time or crypto-conditions
- Built-in feature, not a smart contract
- Supports complex conditional logic

### 5. Payment Channels
- For high-frequency micropayments
- Off-ledger transactions with on-ledger settlement
- Native feature

### 6. Multi-signing
- Complex account control
- Multiple signatures required for transactions
- Built-in functionality

### 7. Cross-Border Payments
- Atomic multi-hop payments
- Cross-currency transactions
- Path-finding for optimal routes

### 8. Credentials (v2.3.0 - 2024)
- New feature for identity and attestations
- Native implementation

### 9. Clawback
- For regulatory compliance
- AMM support added in v2.3.0

## Transaction Speed and Cost
- 3-5 second consensus
- Fractions of a penny per transaction
- Energy efficient

## Development Tools
- **xrpl.js**: JavaScript/TypeScript library for XRPL interaction
- **rippled**: Core server software
- Testnet and Devnet for development

## What XRPL Does NOT Have
- ❌ Smart contracts
- ❌ Hooks (planned for future, not current)
- ❌ EVM compatibility
- ❌ General-purpose programmability

## Design Philosophy
XRPL implements common blockchain use cases as **native features** rather than through programmable contracts. This approach provides:
- Enhanced security
- Better performance
- Lower costs
- Simpler development

## Future Plans
- Hooks may be added in 2025 (not Turing complete, limited functionality)
- Focus remains on native features over general programmability

---
*Last updated: December 2024*
*Source: Official XRPL documentation and Ripple CTO statements*