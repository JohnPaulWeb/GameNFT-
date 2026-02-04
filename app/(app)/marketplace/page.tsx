'use client';

import { useMarketplace } from '@/components/providers';
import { NftCard } from '@/components/nft-card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCurrentAccount } from '@mysten/dapp-kit';

export default function MarketplacePage() {
  const { nfts, buyNft } = useMarketplace();
  const account = useCurrentAccount();

  const nftsForSale = nfts.filter(
    (nft) => nft.isListed && nft.owner !== account?.address
  );

  return (
    <div className="animate-in fade-in-0">
      {nftsForSale.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {nftsForSale.map((nft) => (
            <NftCard key={nft.id} nft={nft}>
              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => buyNft(nft)}
                disabled={!account}
              >
                <ShoppingCart className="mr-2" />
                Buy Now for {nft.price} SUI
              </Button>
            </NftCard>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-lg">
          <h2 className="text-2xl font-semibold text-muted-foreground">
            Marketplace is empty
          </h2>
          <p className="mt-2 text-muted-foreground">
            Check your own collection or check back later for new items!
          </p>
        </div>
      )}
    </div>
  );
}
