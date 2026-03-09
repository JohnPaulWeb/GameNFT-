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


// ito yung interface ListedNft
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
// ito yung ListEventFields
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


// dito magsisimula yung website mo
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


  // ito yung fetchListings
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

      // ito yung listedItems
      const listedItems = result.data
        .map((event) => {
          const fields = event.parsedJson as ListEventFields | undefined;
          const rawNftId = fields?.nft_id;
          const nftId = typeof rawNftId === 'string' ? rawNftId : rawNftId?.id ?? rawNftId?.bytes ?? '';
          const normalizedId = nftId.startsWith('0x') ? nftId : `0x${nftId}`;
          // ito yuung  pag return mo 
          return {
            nftId: normalizedId,
            seller: fields?.seller ?? '',
            priceInMist: BigInt(fields?.price ?? 0),
          };
        })
        .filter((item) => item.nftId && item.nftId !== '0x');

      const activeListings: ListedNFT[] = [];

      // ito yung listedItems
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

      // ito yung catch
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
      //dito magsisimula yung contract mo 
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
      // ito yung Sign and Execute Transaction
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
    <div className="min-h-screen w-full">
      {/* ═══════════════════════════════════════
          HERO — section label + bold heading + inline stats
      ═══════════════════════════════════════ */}
      <section className="border-b border-white/[0.06] px-4 pb-12 pt-12 md:px-8 md:pb-16 md:pt-16">
        <div className="mx-auto max-w-7xl">
          {/* Section label */}
          <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-cyan-400/30 bg-cyan-400/[0.08] px-4 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-300">Live Marketplace</span>
          </div>

          {/* Heading row */}
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-white md:text-7xl">
                NFT
                <br />
                <span className="text-cyan-300">Marketplace</span>
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-white/50 md:text-lg">
                Discover, collect, and trade premium gaming NFTs with transparent pricing and instant settlement on Sui.
              </p>
            </div>

            {/* Inline stat chips + refresh */}
            <div className="flex flex-wrap items-stretch gap-3">
              <div className="rounded-2xl border border-white/[0.09] bg-white/[0.03] px-6 py-5">
                <p className="font-display text-4xl font-bold text-white">{listings.length}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-white/35">Listed</p>
              </div>
              <div className="rounded-2xl border border-cyan-400/25 bg-cyan-400/[0.06] px-6 py-5">
                <p className="font-display text-4xl font-bold text-cyan-300">{totalVolume.toFixed(1)}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-cyan-400/60">SUI Volume</p>
              </div>
              <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.09] bg-white/[0.03] px-5 py-5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchListings}
                  disabled={isLoading}
                  className="h-auto flex-col gap-1.5 p-0 text-white/50 hover:bg-transparent hover:text-white"
                >
                  <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin text-cyan-300' : ''}`} />
                  <span className="text-[11px] font-semibold uppercase tracking-wider">{isLoading ? 'Loading' : 'Refresh'}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Wallet status bar */}
          {account ? (
            <div className="mt-8 flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="font-mono text-xs font-medium text-white/60">{account.address.slice(0, 10)}...{account.address.slice(-6)}</span>
              <span className="ml-auto text-xs font-semibold text-emerald-300">Wallet Connected</span>
            </div>
          ) : (
            <div className="mt-8 flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
              <Wallet className="h-4 w-4 text-white/30" />
              <span className="text-xs font-medium text-white/40">Connect wallet to purchase items</span>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          NFT GRID — toolbar + cards
      ═══════════════════════════════════════ */}
      <section className="px-4 py-10 md:px-8 md:py-14">
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
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 md:p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                    <input
                    // ito naman yung
                      type="text"
                      placeholder="Search by NFT name"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-white/25 focus:border-cyan-400/40 focus:bg-white/[0.06] focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex gap-2">
                    <select
                    // ito naman yung div
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'newest' | 'price-low' | 'price-high')}
                      className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white/80 focus:border-cyan-400/40 focus:outline-none transition-colors"
                    >
                      <option value="newest" className="bg-[hsl(var(--bg-tertiary))]">Newest</option>
                      <option value="price-low" className="bg-[hsl(var(--bg-tertiary))]">Price: Low to High</option>
                      <option value="price-high" className="bg-[hsl(var(--bg-tertiary))]">Price: High to Low</option>
                    </select>

                    <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.04] p-1">
                      {/* ito naman yung button */}
                      <button
                        onClick={() => setGridView('comfortable')}
                        className={`rounded-lg p-2 transition-colors ${
                          gridView === 'comfortable' ? 'bg-cyan-400/15 text-cyan-300' : 'text-white/35 hover:text-white/70'
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
                          gridView === 'compact' ? 'bg-cyan-400/15 text-cyan-300' : 'text-white/35 hover:text-white/70'
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
                  <p className="mt-1 text-sm text-white/40">
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
                <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.09] bg-white/[0.01] p-8 text-center">
                  <p className="text-lg font-semibold text-white/80">No matching NFTs</p>
                  <p className="mt-1 text-sm text-white/35">
                    Try another search or clear your filter to see more listings.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex min-h-[520px] flex-col items-center justify-center p-12 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06]">
                <ShoppingCart className="h-9 w-9 text-cyan-300/60" />
              </div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Marketplace</span>
              </div>
              <h2 className="font-display text-4xl font-bold text-white md:text-5xl">No Listings Yet</h2>
              <p className="mt-4 max-w-sm text-base text-white/40">
                Once creators publish items, they will appear here with live prices and purchase actions.
              </p>
              {account ? (
                <Button
                  size="lg"
                  className="mt-8 rounded-full bg-cyan-500 px-7 font-bold text-[hsl(var(--bg-void))] hover:bg-cyan-400 transition-colors"
                  onClick={() => { window.location.href = '/mint'; }}
                >
                  <Package className="mr-2 h-5 w-5" />
                  Mint Your First NFT
                </Button>
              ) : (
                // ito naman yung text
                <p className="mt-8 text-sm text-white/35">
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
