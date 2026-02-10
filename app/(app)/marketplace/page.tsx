'use client';

import { useMarketplace } from '@/app/components/providers';
import { NftCard } from '@/app/components/nft-card';
import { Button } from '@/app/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCurrentAccount } from '@mysten/dapp-kit';

export default function MarketplacePage() {
  const { nfts, buyNft } = useMarketplace();
  const account = useCurrentAccount();

  const nftsForSale = nfts.filter(
    (nft) => nft.isListed
  );

  return (
    <div className="h-full w-full space-y-8">
      {nftsForSale.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 justify-items-center sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {nftsForSale.map((nft) => (
            <NftCard key={nft.id} nft={nft}>
              <Button
                className="w-full font-semibold shadow-sm"
                size="lg"
                onClick={() => buyNft(nft)}
                disabled={!account || nft.owner === account?.address}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {nft.owner === account?.address ? 'Your Item' : `Buy for ${nft.price} SUI`}
              </Button>
            </NftCard>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[500px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 p-12 text-center">
          <ShoppingCart className="mb-6 h-16 w-16 text-muted-foreground/70" />
          <h2 className="text-2xl font-bold">No items for sale</h2>
          <p className="mt-3 text-muted-foreground">
            Check back later for new items!
          </p>
        </div>
      )}
    </div>
  );
}
