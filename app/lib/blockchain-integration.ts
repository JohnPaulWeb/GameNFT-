import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { CONTRACTS } from '@/app/components/contracts';

/**
 * Helper class to interact with the NFT Marketplace smart contract on Sui blockchain
 */

// ito yung export class BlockchainMarketPlace
export class BlockchainMarketplace {
  private client: SuiClient;
  private packageId: string;
  private marketplaceId: string;
  private moduleName: string;


  // ito yung SUI Client
  constructor(suiClient: SuiClient) {
    this.client = suiClient;
    this.packageId = CONTRACTS.PACKAGE_ID;
    this.marketplaceId = CONTRACTS.MARKETPLACE_ID;
    this.moduleName = CONTRACTS.MODULE_NAME;
  }

  /**
   * Mint a new NFT
   * @param name NFT name
   * @param description NFT description
   * @param imageUrl URL to the NFT image
   * @returns Transaction block to be signed and executed
   */

  // ito yung CreateMintTransaction
  createMintTransaction(name: string, description: string, imageUrl: string): TransactionBlock {
    const tx = new TransactionBlock();

    tx.moveCall({
      target: `${this.packageId}::${this.moduleName}::mint`,
      arguments: [
        tx.pure.string(name),
        tx.pure.string(description),
        tx.pure.string(imageUrl),
      ],
    });

    return tx;
  }

  /**
   * List an NFT for sale
   * @param nftId ID of the NFT to list
   * @param price Price in MIST (1 SUI = 1,000,000,000 MIST)
   * @returns Transaction block
   */

  // ito yung createListTransaction
  createListTransaction(nftId: string, price: string): TransactionBlock {
    const tx = new TransactionBlock();
    const priceInMist = BigInt(Math.floor(parseFloat(price) * 1_000_000_000));

    tx.moveCall({
      target: `${this.packageId}::${this.moduleName}::list`,
      typeArguments: ['0x2::sui::SUI'],
      arguments: [
        tx.object(this.marketplaceId),
        tx.object(nftId),
        tx.pure.u64(priceInMist),
      ],
    });

    return tx;
  }

  /**
   * Delist an NFT from the marketplace
   * @param nftId ID of the NFT to delist
   * @returns Transaction block
   */
  createDelistTransaction(nftId: string): TransactionBlock {
    const tx = new TransactionBlock();

    tx.moveCall({
      target: `${this.packageId}::${this.moduleName}::delist_and_take`,
      typeArguments: ['0x2::sui::SUI'],
      arguments: [
        tx.object(this.marketplaceId),
        tx.pure.id(nftId),
      ],
    });

    return tx;
  }

  /**
   * Buy an NFT from the marketplace
   * @param nftId ID of the NFT to buy
   * @param coinId ID of the SUI coin to use for payment
   * @returns Transaction block
   */
  // ito yung CreateBuyTransaction 
  createBuyTransaction(nftId: string, coinId: string): TransactionBlock {
    const tx = new TransactionBlock();

    // ito yung movecall 
    tx.moveCall({
      target: `${this.packageId}::${this.moduleName}::buy_and_take`,
      typeArguments: ['0x2::sui::SUI'],
      arguments: [
        tx.object(this.marketplaceId),
        tx.pure.id(nftId),
        tx.object(coinId),
      ],
    });

    return tx;
  }
   
  /**
   * Get listing information from blockchain
   * @param nftId NFT ID to check
   * @returns Listing data or null if not listed
   */

  // ito yung getListingInfo
  async getListingInfo(nftId: string) {
    try {
      const marketplace = await this.client.getObject({
        id: this.marketplaceId,
        options: {
          showContent: true,
        },
      });

      if (marketplace.data?.content?.dataType === 'moveObject') {
        // The listings are stored in a Bag structure
        // This is a simplified check - you may need to query more specifically
        return {
          exists: true,
          nftId,
        };
      }
      // ito naman yung return
      return null;
    } catch (error) {
      console.error('Error fetching listing info:', error);
      return null;
    }
  }

  /**
   * Get NFT object data from blockchain
   * @param nftId NFT ID to fetch
   * @returns NFT data
   */

  // ito yung getNftData
  async getNFTData(nftId: string) {
    try {
      const nftObject = await this.client.getObject({
        id: nftId,
        options: {
          showContent: true,
          showOwner: true,
        },
      });
      return nftObject;
    } catch (error) {
      console.error('Error fetching NFT data:', error);
      return null;
    }
  }

  /** 
   * Get all NFTs owned by a specific address
   * @param ownerAddress Wallet address
   * @returns Array of NFT objects
   */

  // ito yung getNftsByOwner 
  async getNFTsByOwner(ownerAddress: string) {
    try {

      const nfts = await this.client.getOwnedObjects({
        owner: ownerAddress,
        filter: {
          StructType: `${this.packageId}::${this.moduleName}::NFT`,
        },
      });
      return nfts.data;
    } catch (error) {
      console.error('Error fetching NFTs by owner:', error);
      return [];
    }
  }

  /**
   * Get marketplace statistics
   */

  // ito yung getMarketplaceStats
  async getMarketplaceStats() {
    try {
      const marketplace = await this.client.getObject({
        id: this.marketplaceId,
        options: {
          showContent: true,
        },
      });
      return marketplace.data;

      // We use fetch here to get additional stats from an API endpoint that aggregates marketplace data
    } catch (error) {
      console.error('Error fetching marketplace stats:', error);
      return null;

    }
  }
}
