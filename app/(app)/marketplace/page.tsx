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


<div className="relative min-h-screen w-full">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-28 left-[-18%] h-96 w-96 rounded-full bg-cyan-400/12 blur-3xl" />
        <div className="absolute top-24 right-[-12%] h-[28rem] w-[28rem] rounded-full bg-indigo-500/12 blur-3xl" />
      </div>

      <section className="px-4 pb-8 pt-10 md:px-8 md:pb-10 md:pt-14">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-3xl border border-white/10 bg-black/20 p-6 backdrop-blur-xl md:flex-row md:items-end md:justify-between md:p-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-cyan-300" />
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-200">Live Marketplace</span>
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white md:text-6xl">
              Curated NFT Marketplace
            </h1>
            <p className="max-w-2xl text-base text-[hsl(var(--text-secondary))] md:text-lg">
              Discover cleanly presented collections, transparent pricing, and fast checkout on Sui.
            </p>
          </div>

          <Button
            variant="outline"
            size="lg"
            onClick={fetchListings}
            disabled={isLoading}
            className="w-fit"
          >
            {/* ito naman yung icon */}
            <RefreshCw className={`mr-2 h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing' : 'Refresh Listings'}
          </Button>
        </div>
      </section>

      <section className="px-4 pb-6 md:px-8 md:pb-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--text-secondary))]">Listed Items</p>
              <Package className="h-5 w-5 text-cyan-300" />
            </div>
            <p className="font-display text-3xl font-bold text-white">{listings.length}</p>
            <p className="mt-1 text-xs text-[hsl(var(--text-muted))]">currently available</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--text-secondary))]">Total Volume</p>
              <TrendingUp className="h-5 w-5 text-cyan-300" />
            </div>
            <p className="font-display text-3xl font-bold text-white">{totalVolume.toFixed(1)}</p>
            <p className="mt-1 text-xs text-[hsl(var(--text-muted))]">SUI across all listings</p>
          </div>

          {/* ito naman yung wallet design */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--text-secondary))]">Wallet</p>
              <Wallet className="h-5 w-5 text-cyan-300" />
            </div>
            {account ? (
              <>
                <p className="font-mono text-base font-semibold text-white">
                  {account.address.slice(0, 10)}...{account.address.slice(-6)}
                </p>
                <p className="mt-1 text-xs text-emerald-300">connected</p>
              </>
            ) : (
              <>
                <p className="text-base font-semibold text-white">No wallet connected</p>
                <p className="mt-1 text-xs text-[hsl(var(--text-muted))]">connect to purchase items</p>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 pb-12 md:px-8 md:pb-16">
        <div className="mx-auto max-w-7xl">
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
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl md:p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--text-muted))]" />
                    <input
                    // ito naman yung
                      type="text"
                      placeholder="Search by NFT name"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-[hsl(var(--text-muted))] focus:border-cyan-400/50 focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <select
                    // ito naman yung div
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'newest' | 'price-low' | 'price-high')}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
                    >
                      <option value="newest" className="bg-[hsl(var(--bg-tertiary))]">Newest</option>
                      <option value="price-low" className="bg-[hsl(var(--bg-tertiary))]">Price Low to High</option>
                      <option value="price-high" className="bg-[hsl(var(--bg-tertiary))]">Price High to Low</option>
                    </select>

                    <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
                      {/* ito naman yung button */}
                      <button
                        onClick={() => setGridView('comfortable')}
                        className={`rounded-lg p-2 transition-colors ${
                          gridView === 'comfortable' ? 'bg-cyan-400/20 text-cyan-300' : 'text-[hsl(var(--text-secondary))] hover:text-white'
                        }`}
                        aria-label="Comfortable grid"
                      >
                        {/* ito naman yung Layout */}
                        <LayoutGrid className="h-4 w-4" />
                      </button>
                      {/* ito yung button */}
                      <button
                        onClick={() => setGridView('compact')}
                        className={`rounded-lg p-2 transition-colors ${
                          gridView === 'compact' ? 'bg-cyan-400/20 text-cyan-300' : 'text-[hsl(var(--text-secondary))] hover:text-white'
                        }`}
                        aria-label="Compact grid"
                      >
                        <Grid3x3 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold text-white md:text-3xl">Available NFTs</h2>
                  <p className="mt-1 text-sm text-[hsl(var(--text-secondary))]">
                    {filteredAndSortedListings.length} {filteredAndSortedListings.length === 1 ? 'item' : 'items'} {searchQuery ? 'matched' : 'available'}
                  </p>
                </div>
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
                          className="w-full font-semibold text-base"
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
                // ito naman yung  div content 
                <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
                  <p className="text-lg font-semibold text-white">No matching NFTs</p>
                  <p className="mt-1 text-sm text-[hsl(var(--text-secondary))]">
                    Try another search or clear your filter to see more listings.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex min-h-[460px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-white/10 bg-white/[0.02] p-12 text-center animate-fade-in">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10">
                <ShoppingCart className="h-10 w-10 text-cyan-300/60" />
              </div>
              <h2 className="font-display text-3xl font-bold text-white md:text-4xl">No Listings Yet</h2>
              <p className="mt-3 max-w-md text-base text-[hsl(var(--text-secondary))]">
                Once creators publish items, they will appear here with live prices and purchase actions.
              </p>
              {account ? (
                <Button size="lg" className="mt-8" onClick={() => { window.location.href = '/mint'; }}>
                  <Package className="mr-2 h-5 w-5" />
                  Mint Your First NFT
                </Button>
              ) : (
                // ito naman yung text
                <p className="mt-8 text-sm text-[hsl(var(--text-secondary))]">
                  Connect your wallet to start trading.
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
