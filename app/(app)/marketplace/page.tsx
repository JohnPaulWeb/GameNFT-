'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { ShoppingCart, Wallet, TrendingUp, Package, RefreshCw, Search, Grid3x3, LayoutGrid } from 'lucide-react';
import { Transaction } from '@mysten/sui/transactions';
import { bcs } from '@mysten/sui/bcs';

import { Button } from '@/app/components/ui/button';
import { NftCard } from '@/app/components/nft-card';
import { useToast } from '@/app/hooks/use-toast';
import { CONTRACTS } from '@/app/components/contracts';
import { NftGridSkeleton } from '@/app/components/ui/nft-skeleton';

interface ListedNFT {
  listingId: string;
  nftId: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  priceInMist: bigint;
  seller: string;
}

type ListEventFields = {
  nft_id?: string | { id?: string; bytes?: string };
  seller?: string;
  price?: string | number | bigint;
};

type ListingFields = {
  price?: string | number | bigint;
  seller?: string;
};

type NftFields = {
  name?: string;
  description?: string;
  url?: string;
};

export default function MarketplacePage() {
  const [listings, setListings] = useState<ListedNFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest');
  const [gridView, setGridView] = useState<'comfortable' | 'compact'>('comfortable');

  const account = useCurrentAccount();
  const client = useSuiClient();
  const { toast } = useToast();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: { showEffects: true },
      }),
  });

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await client.queryEvents({
        query: {
          MoveEventType: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::ListNFTEvent`,
        },
        limit: 50,
      });

      if (result.data.length === 0) {
        setListings([]);
        setIsLoading(false);
        return;
      }

      const listedItems = result.data
        .map((event) => {
          const fields = event.parsedJson as ListEventFields | undefined;
          const rawNftId = fields?.nft_id;
          const nftId = typeof rawNftId === 'string' ? rawNftId : rawNftId?.id ?? rawNftId?.bytes ?? '';
          const normalizedId = nftId.startsWith('0x') ? nftId : `0x${nftId}`;

          return {
            nftId: normalizedId,
            seller: fields?.seller ?? '',
            priceInMist: BigInt(fields?.price ?? 0),
          };
        })
        .filter((item) => item.nftId && item.nftId !== '0x');

      const activeListings: ListedNFT[] = [];

      for (const item of listedItems) {
        try {
          const nftObject = await client.getObject({
            id: item.nftId,
            options: { showContent: true, showOwner: true, showType: true },
          });

          if (!nftObject.data) continue;

          const owner = nftObject.data.owner;
          const isStillListed = owner && typeof owner === 'object' && 'ObjectOwner' in owner;

          if (!isStillListed) {
            continue;
          }

          const listingId = (owner as any).ObjectOwner as string;

          const listingObject = await client.getObject({
            id: listingId,
            options: { showContent: true },
          });

          const listingFields = (listingObject.data?.content as { fields?: ListingFields } | undefined)?.fields;
          const nftFields = (nftObject.data?.content as { fields?: NftFields } | undefined)?.fields;

          if (!listingFields || !nftFields) continue;
          // ito yung listingFields
          const priceInMist = BigInt(listingFields.price ?? item.priceInMist);

          // ito yung part na nag-aassemble ng data para sa marketplace listing
          activeListings.push({
            listingId,
            nftId: item.nftId,
            name: nftFields.name ?? 'Unknown NFT',
            description: nftFields.description ?? '',
            imageUrl: nftFields.url ?? '',
            price: Number(priceInMist) / 1_000_000_000,
            priceInMist,
            seller: listingFields.seller ?? item.seller,
          });
          // ito naman yung error
        } catch (err) {
          console.warn('Error processing NFT', item.nftId, err);
        }
      }
    
      setListings(activeListings);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to load marketplace',
        description: 'Could not fetch listings from the blockchain.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [client, toast]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // ito naman yung handle 
  const handleBuy = async (listing: ListedNFT) => {
    if (!account) {
      // ito naman yung toast
      toast({
        variant: 'destructive',
        title: 'Wallet not connected',
        description: 'Please connect your wallet to buy NFTs.',
      });
      return;
    }

    setBuyingId(listing.nftId);

    try {
      const tx = new Transaction();

      const [paymentCoin] = tx.splitCoins(tx.gas, [
        tx.pure(bcs.u64().serialize(listing.priceInMist)),
      ]);

      tx.moveCall({
        target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::buy_and_take`,
        typeArguments: [
          `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::NFT`,
          '0x2::sui::SUI',
        ],
        arguments: [
          tx.object(CONTRACTS.MARKETPLACE_ID),
          tx.pure.id(listing.nftId),
          paymentCoin,
        ],
      });

      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: () => {
            toast({
              title: 'Purchase Successful',
              description: `You bought ${listing.name} for ${listing.price} SUI.`,
            });
            setTimeout(() => fetchListings(), 1500);
            setBuyingId(null);
          },
          onError: (error: unknown) => {
            const msg = error instanceof Error ? error.message : 'Transaction failed';
            toast({
              variant: 'destructive',
              title: 'Purchase Failed',
              description: msg.includes('InsufficientCoinBalance') ? 'Not enough SUI in your wallet.' : msg,
            });
            setBuyingId(null);
          },
        }
      );
    } catch (error) {
      console.error('Buy tx error:', error);
      toast({
        variant: 'destructive',
        title: 'Transaction Error',
        description: error instanceof Error ? error.message : 'Failed.',
      });
      setBuyingId(null);
    }
  };



  const filteredAndSortedListings = useMemo(() => {
    const filtered = listings.filter((listing) =>
      listing.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    const sorted = [...filtered];
    if (sortBy === 'price-low') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      sorted.sort((a, b) => b.price - a.price);
    } else {
      sorted.sort((a, b) => b.listingId.localeCompare(a.listingId));
    }

    return sorted;
  }, [listings, searchQuery, sortBy]);

  const totalVolume = useMemo(
    () => listings.reduce((sum, listing) => sum + listing.price, 0),
    [listings]
  );

  // dito magsisimula yung code mo here

  return (
    <div className="w-full">
      <section className="px-6 pb-8 pt-8 md:px-8 md:pb-10 md:pt-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border-default))] bg-[hsl(var(--bg-secondary))] px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-[hsl(var(--accent-indigo))]" />
              <span className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--text-secondary))]">Collections</span>
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-white md:text-4xl">
              NFT Marketplace
            </h1>
            <p className="max-w-2xl text-sm text-[hsl(var(--text-secondary))]">
              Explore curated digital assets with transparent pricing on Sui blockchain.
            </p>
          </div>

          <Button
            className="btn-outline w-fit"
            onClick={fetchListings}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing' : 'Refresh'}
          </Button>
        </div>
      </section>

      <section className="px-6 pb-8 md:px-8 md:pb-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-[hsl(var(--border-default))] bg-[hsl(var(--bg-secondary))] p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--text-secondary))]">Listed</p>
              <Package className="h-4 w-4 text-[hsl(var(--accent-indigo))]" />
            </div>
            <p className="font-display text-2xl font-semibold text-white">{listings.length}</p>
            <p className="mt-1 text-xs text-[hsl(var(--text-muted))]">items available</p>
          </div>

          <div className="rounded-lg border border-[hsl(var(--border-default))] bg-[hsl(var(--bg-secondary))] p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--text-secondary))]">Volume</p>
              <TrendingUp className="h-4 w-4 text-[hsl(var(--accent-cyan))]" />
            </div>
            <p className="font-display text-2xl font-semibold text-white">{totalVolume.toFixed(1)}</p>
            <p className="mt-1 text-xs text-[hsl(var(--text-muted))]">SUI total</p>
          </div>

          <div className="rounded-lg border border-[hsl(var(--border-default))] bg-[hsl(var(--bg-secondary))] p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--text-secondary))]">Status</p>
              <Wallet className="h-4 w-4 text-[hsl(var(--accent-emerald))]" />
            </div>
            {account ? (
              <>
                <p className="font-mono text-sm font-medium text-white">
                  {account.address.slice(0, 8)}...
                </p>
                <p className="mt-1 text-xs text-[hsl(var(--accent-emerald))]">connected</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-white">Disconnected</p>
                <p className="mt-1 text-xs text-[hsl(var(--text-muted))]">connect wallet</p>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="px-6 pb-12 md:px-8 md:pb-16 max-w-7xl mx-auto w-full">
        <div>
          {isLoading ? (
            // ito naman yung skeleton loader kapag naglo-load pa ng listings
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="h-8 w-56 rounded-lg bg-white/10 shimmer" />
                <div className="h-4 w-72 rounded-lg bg-white/5 shimmer" />
              </div>
              <NftGridSkeleton count={8} />
            </div>
          ) : listings.length > 0 ? (
            <div className="space-y-6 animate-fade-in">
              <div className="rounded-lg border border-[hsl(var(--border-default))] bg-[hsl(var(--bg-secondary))] p-4 md:p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="relative flex-1 md:max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--text-muted))]" />
                    <input
                      type="text"
                      placeholder="Search by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-lg border border-[hsl(var(--border-default))] bg-[hsl(var(--bg-tertiary))] py-2 pl-10 pr-3 text-sm text-white placeholder:text-[hsl(var(--text-muted))] focus:border-[hsl(var(--accent-indigo)_/_0.5)] focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'newest' | 'price-low' | 'price-high')}
                      className="rounded-lg border border-[hsl(var(--border-default))] bg-[hsl(var(--bg-tertiary))] px-3 py-2 text-sm text-white focus:border-[hsl(var(--accent-indigo)_/_0.5)] focus:outline-none transition-colors"
                    >
                      <option value="newest" className="bg-[hsl(var(--bg-tertiary))]">Newest</option>
                      <option value="price-low" className="bg-[hsl(var(--bg-tertiary))]">Price: Low to High</option>
                      <option value="price-high" className="bg-[hsl(var(--bg-tertiary))]">Price: High to Low</option>
                    </select>

                    <div className="flex items-center gap-1 rounded-lg border border-[hsl(var(--border-default))] bg-[hsl(var(--bg-tertiary))] p-1">
                      <button
                        onClick={() => setGridView('comfortable')}
                        className={`rounded-md p-2 transition-colors ${
                          gridView === 'comfortable' ? 'bg-[hsl(var(--accent-indigo)_/_0.15)] text-[hsl(var(--accent-indigo))]' : 'text-[hsl(var(--text-secondary))] hover:text-white'
                        }`}
                        aria-label="Comfortable grid"
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setGridView('compact')}
                        className={`rounded-md p-2 transition-colors ${
                          gridView === 'compact' ? 'bg-[hsl(var(--accent-indigo)_/_0.15)] text-[hsl(var(--accent-indigo))]' : 'text-[hsl(var(--text-secondary))] hover:text-white'
                        }`}
                        aria-label="Compact grid"
                      >
                        <Grid3x3 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-baseline gap-3">
                <h2 className="font-display text-lg font-semibold text-white">Results</h2>
                <p className="text-sm text-[hsl(var(--text-secondary))]">
                  {filteredAndSortedListings.length} {filteredAndSortedListings.length === 1 ? 'item' : 'items'} {searchQuery ? 'found' : 'available'}
                </p>
              </div>

              {filteredAndSortedListings.length > 0 ? (
                <div
                  className={`grid gap-5 ${
                    gridView === 'comfortable'
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                      : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                  }`}
                >
                  {filteredAndSortedListings.map((listing, index) => (
                    <div key={listing.nftId} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-up">
                      <NftCard
                        nft={{
                          id: listing.nftId,
                          name: listing.name,
                          description: listing.description,
                          imageUrl: listing.imageUrl,
                          imageHint: listing.name,
                          owner: listing.seller,
                          isListed: true,
                          price: listing.price,
                        }}
                      >
                        <Button
                          className="w-full font-medium text-sm"
                          onClick={() => handleBuy(listing)}
                          disabled={!account || listing.seller === account?.address || buyingId === listing.nftId}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {!account
                            ? 'Connect Wallet'
                            : listing.seller === account?.address
                            ? 'Your Listing'
                            : buyingId === listing.nftId
                            ? 'Purchasing...'
                            : `Buy for ${listing.price} SUI`}
                        </Button>
                      </NftCard>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-[hsl(var(--border-default))] bg-gradient-to-br from-[hsl(var(--bg-secondary)_/_0.3)] to-[hsl(var(--bg-tertiary)_/_0.2)] p-8 text-center">
                  <p className="text-lg font-medium text-white">No matching NFTs</p>
                  <p className="mt-1 text-sm text-[hsl(var(--text-secondary))]">
                    Try another search or adjust filters.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-lg border border-dashed border-[hsl(var(--border-default))] bg-gradient-to-br from-[hsl(var(--bg-secondary)_/_0.3)] to-[hsl(var(--bg-tertiary)_/_0.2)] p-12 text-center animate-fade-in">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[hsl(var(--accent-indigo)_/_0.2)] bg-[hsl(var(--accent-indigo)_/_0.08)]">
                <ShoppingCart className="h-8 w-8 text-[hsl(var(--accent-indigo)_/_0.5)]" />
              </div>
              <h2 className="font-display text-2xl font-semibold text-white md:text-3xl">No Listings Available</h2>
              <p className="mt-2 max-w-md text-sm text-[hsl(var(--text-secondary))]">
                New NFTs will appear here once creators publish them.
              </p>
              {account ? (
                <Button className="btn-primary mt-6" onClick={() => { window.location.href = '/mint'; }}>
                  <Package className="mr-2 h-4 w-4" />
                  Mint First NFT
                </Button>
              ) : (
                <p className="mt-6 text-xs text-[hsl(var(--text-muted))]">
                  Connect your wallet to get started.
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
