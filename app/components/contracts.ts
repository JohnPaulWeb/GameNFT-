// contracts.ts
// After deploying the Move contract, update these values with your deployed addresses
// See DEPLOYMENT_GUIDE.md for instructions

export const CONTRACTS = {
  // The package ID from "Published Objects" after deployment
  // Format: 0x + 64 hex characters
  PACKAGE_ID: "0xa6de9c1ab09e798b59912a671816aa3deb30f34b38f04cfb2c171efb6ea78a4a",
  
  // The Marketplace object ID from "Created Objects" after deployment
  // This is the shared object created in the init() function
  // Format: 0x + 64 hex characters
  MARKETPLACE_ID: "0x9b5a733d61a1126d8f02db38f91593a6436f9ad8c6aada395076af7a21457ed4",
  
  // The UpgradeCap object ID (needed if you want to upgrade the contract)
  UPGRADE_CAP_ID: "0x67bf99c003939cb8e0d6b3e9c80abb04b25c16f015f1fd616e68e631a588f6b7",
  
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

