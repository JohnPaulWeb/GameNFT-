// =====================================================
// REPLACE THESE VALUES WITH YOUR DEPLOYED CONTRACT INFO
// Run: sui client publish --gas-budget 100000000
// Then check the output for "Published Objects" section
// =====================================================

export const CONTRACTS = {
  // Your deployed package ID from `sui client publish` output
  // Example: "0x1a2b3c4d5e6f..."
  // ito yung Package ID ng contract mo
  PACKAGE_ID: '0x204187be671e09b8f8af560bfc0b0ba59aef48386c9b03f1f38824de6ca535d5',

  // The Move module name (matches: module nft::nft_marketplace)
  // ito yung name ng Blockchain mo 
  MODULE_NAME: 'nft_marketplace',

  // The shared Marketplace object ID created during init()
  // Find it in the publish output under "Created Objects" → type contains "Marketplace"
  MARKETPLACE_ID: '0x355bf731f370143cc9fd3f269d75c1ba3bb63584def437fe801486eefa5819f5',

  // this is where your contract is deployed
  // The network you deployed to

  // ito yung network sa Blockchain mo SUI 
  NETWORK: 'testnet', // change to 'mainnet' if on mainnet
} as const;

// =====================================================
// HOW TO FIND YOUR IDs:
//
// 1. After publishing, run:
//    sui client object <PACKAGE_ID>
//
// 2. Or check the Sui Explorer:
//    Testnet: https://suiexplorer.com/?network=testnet
//    Mainnet: https://suiexplorer.com/
//
// 3. Or from your terminal publish output, look for:
//    "PackageID: 0x..."  → this is your PACKAGE_ID
//    "ObjectID: 0x..." with type "...::Marketplace" → this is your MARKETPLACE_ID
// =====================================================
