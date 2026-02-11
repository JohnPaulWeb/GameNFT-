import { TransactionBlock } from '@mysten/sui.js/transactions';
import { CONTRACTS } from '@/app/components/contracts';

export class NFTMarketplaceTransactions {
  
  // Mint NFT
  static mintNFT(name: string, description: string, imageUrl: string) {
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::mint`,
      arguments: [
        tx.pure(Array.from(new TextEncoder().encode(name))),
        tx.pure(Array.from(new TextEncoder().encode(description))),
        tx.pure(Array.from(new TextEncoder().encode(imageUrl))),
      ],
    });
    
    
    return tx;
  }
  
  // List NFT
  static listNFT(nftId: string, price: string) {
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::list`,
      typeArguments: [
        `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::NFT`,
        '0x2::sui::SUI'
      ],
      arguments: [
        tx.object(CONTRACTS.MARKETPLACE_ID),
        tx.object(nftId),
        tx.pure(price), // Price in MIST
      ],
    });
    
    return tx;
  }
  
  // Delist NFT
  static delistNFT(nftId: string) {
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::delist_and_take`,
      typeArguments: [
        `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::NFT`,
        '0x2::sui::SUI'
      ],
      arguments: [
        tx.object(CONTRACTS.MARKETPLACE_ID),
        tx.pure(nftId),
      ],
      
    });
    
    return tx;
  }
  
  // Buy NFT
  static buyNFT(nftId: string, paymentCoinId: string) {
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::buy_and_take`,
      typeArguments: [
        `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::NFT`,
        '0x2::sui::SUI'
      ],
      arguments: [
        tx.object(CONTRACTS.MARKETPLACE_ID),
        tx.pure(nftId),
        tx.object(paymentCoinId),
      ],
    });
    
    return tx;
  }
  
  // Update NFT Description
  static updateDescription(nftId: string, newDescription: string) {
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::update_nft_description`,
      arguments: [
        tx.object(nftId),
        tx.pure(Array.from(new TextEncoder().encode(newDescription))),
      ],
    });
    
    return tx;
  }

  
  // Burn NFT
  static burnNFT(nftId: string) {
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::burn`,
      arguments: [tx.object(nftId)],
    });
    
    return tx;
  }
  
  // Take Profits
  static takeProfits() {
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::take_profits_and_keep`,
      typeArguments: ['0x2::sui::SUI'],
      arguments: [tx.object(CONTRACTS.MARKETPLACE_ID)],
    });
    
    return tx;
  }
}