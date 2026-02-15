'use client';

import { useMarketplace } from '@/app/components/providers';
import { NftCard } from '@/app/components/nft-card';
import { Button } from '@/app/components/ui/button';
import { ShoppingCart, Wallet, TrendingUp, Package } from 'lucide-react';
import { useCurrentAccount } from '@mysten/dapp-kit';

export default function MarketplacePage() {
  const { nfts, buyNft } = useMarketplace();
  const account = useCurrentAccount();

  const nftsForSale = nfts.filter(
    (nft) => nft.isListed
  );

  return (
    <div className="h-full w-full space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
        <p className="text-muted-foreground">
          Discover and collect unique gaming NFTs
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Listed Items</p>
            <p className="text-2xl font-bold">{nftsForSale.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
            <TrendingUp className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Items</p>
            <p className="text-2xl font-bold">{nfts.length}</p>
          </div>
        </div>

        {account && (
          <div className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground">Connected Wallet</p>
              <p className="truncate font-mono text-sm font-semibold">
                {account.address.slice(0, 8)}...{account.address.slice(-6)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* NFT Grid */}
      {nftsForSale.length > 0 ? (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Available NFTs</h2>
            <span className="text-sm text-muted-foreground">
              {nftsForSale.length} {nftsForSale.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-6 justify-items-center sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
        </div>
      ) : (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 p-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <ShoppingCart className="h-10 w-10 text-muted-foreground/70" />
          </div>
          <h2 className="mt-6 text-2xl font-bold">No Items Listed</h2>
          <p className="mt-2 max-w-sm text-muted-foreground">
            There are currently no items available in the marketplace. Check back later or mint your own NFT!
          </p>
          {account && (
            <Button className="mt-6" size="lg" onClick={() => window.location.href = '/mint'}>
              <Package className="mr-2 h-4 w-4" />
              Mint Your First NFT
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
