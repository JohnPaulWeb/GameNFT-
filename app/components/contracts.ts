// contracts.ts
// After deploying the Move contract, update these values with your deployed addresses
// See DEPLOYMENT_GUIDE.md for instructions

export const CONTRACTS = {
  // The package ID from "Published Objects" after deployment
  // Format: 0x + 64 hex characters
  PACKAGE_ID: "0xa760c3344de19543765340179f95acc80ccacb9a727ee34e2f6087179feeab89",
  
  // The Marketplace object ID from "Created Objects" after deployment
  // This is the shared object created in the init() function
  // Format: 0x + 64 hex characters
  MARKETPLACE_ID: "0x71811f94bff5267add2a441a2d11a11c61a301b68979f5b97967d05feec73953",
  
  // The UpgradeCap object ID (needed if you want to upgrade the contract)
  UPGRADE_CAP_ID: "0x83a745f65f558b9b05ba5925c52ded9d247275927e91cb18a02cbb9175edb2eb",
  
  // The module name (matches [package] name in Move.toml)
  MODULE_NAME: "nft_marketplace",
  
  // Network: "testnet" | "mainnet" | "devnet"
  NETWORK: "testnet",
};

// Type definitions for better TypeScript support
export interface ContractConfig {
  PACKAGE_ID: string;
  MARKETPLACE_ID: string;
  UPGRADE_CAP_ID: string;
  MODULE_NAME: string;
  NETWORK: "testnet" | "mainnet" | "devnet";
}