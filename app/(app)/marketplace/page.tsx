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
    <div className="min-h-screen w-full bg-[hsl(var(--bg-void))]">
      {/* ═══════════════════════════════════════
          PREMIUM HERO — Modern Web3 Aesthetic
      ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-cyan-500/20 px-4 pb-20 pt-24 md:px-8 md:pb-28 md:pt-32">
        {/* Animated background glows */}
        <div className="absolute -right-60 -top-60 h-96 w-96 rounded-full bg-gradient-to-br from-cyan-500/15 via-purple-500/10 to-transparent blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-60 h-80 w-80 rounded-full bg-gradient-to-tr from-indigo-600/12 via-transparent to-transparent blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Grid background accent */}
        <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(34,211,238,.05)_25%,rgba(34,211,238,.05)_26%,transparent_27%,transparent_74%,rgba(34,211,238,.05)_75%,rgba(34,211,238,.05)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(34,211,238,.05)_25%,rgba(34,211,238,.05)_26%,transparent_27%,transparent_74%,rgba(34,211,238,.05)_75%,rgba(34,211,238,.05)_76%,transparent_77%,transparent)] bg-[50px_50px] opacity-40" />

        <div className="relative mx-auto max-w-7xl">
          {/* Premium badge with neon glow */}
          <div className="mb-10 inline-flex items-center gap-2.5 rounded-full border border-cyan-400/40 bg-cyan-400/5 px-4 py-2 backdrop-blur-xl hover:border-cyan-400/60 hover:bg-cyan-400/10 transition-all duration-300 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">🔴 Live on Sui Network</span>
          </div>

          {/* Main hero content */}
          <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1 space-y-8">
              {/* Main heading with gradient */}
              <div className="space-y-4">
                <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tighter text-white">
                  NFT
                  <br />
                  <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-200 bg-clip-text text-transparent">Marketplace</span>
                </h1>
              </div>

              {/* Description */}
              <p className="max-w-lg text-base md:text-lg leading-relaxed text-white/70 font-light">
                Trade premium gaming NFTs on the lightning-fast Sui blockchain. Zero-fee listing, instant settlement, and world-class security.
              </p>

              {/* Stats section */}
              <div className="grid grid-cols-3 gap-4 md:gap-6 pt-4">
                <div className="group border border-cyan-500/20 rounded-xl bg-gradient-to-br from-cyan-500/5 to-transparent p-4 backdrop-blur-sm hover:border-cyan-400/40 hover:bg-cyan-500/10 transition-all duration-300">
                  <p className="text-xs uppercase tracking-wider text-cyan-400/70 font-semibold mb-2">Active</p>
                  <p className="text-2xl md:text-3xl font-bold text-cyan-300">{listings.length}</p>
                </div>
                <div className="group border border-purple-500/20 rounded-xl bg-gradient-to-br from-purple-500/5 to-transparent p-4 backdrop-blur-sm hover:border-purple-400/40 hover:bg-purple-500/10 transition-all duration-300">
                  <p className="text-xs uppercase tracking-wider text-purple-400/70 font-semibold mb-2">Volume</p>
                  <p className="text-2xl md:text-3xl font-bold text-purple-300">{totalVolume.toFixed(0)}</p>
                </div>
                <div className="group border border-white/20 rounded-xl bg-gradient-to-br from-white/5 to-transparent p-4 backdrop-blur-sm hover:border-white/40 hover:bg-white/10 transition-all duration-300">
                  <p className="text-xs uppercase tracking-wider text-white/50 font-semibold mb-2">Network</p>
                  <p className="text-xl md:text-2xl font-bold text-white">Sui</p>
                </div>
              </div>
            </div>

            {/* Right side: Enhanced wallet status */}
            <div className="lg:flex-1 flex flex-col gap-6">
              {account ? (
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
                  <div className="relative flex items-center gap-4 rounded-xl border border-cyan-500/30 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent p-5 backdrop-blur-xl">
                    <div className="flex h-3 w-3 items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300 shadow-lg shadow-emerald-400/50">
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-mono text-xs font-medium text-emerald-400">{account.address.slice(0, 12)}...{account.address.slice(-6)}</p>
                      <p className="text-[11px] text-white/40 mt-0.5">Wallet Connected</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-gradient-to-br from-white/[0.05] to-transparent p-5 backdrop-blur-xl">
                  <Wallet className="h-5 w-5 text-white/30" />
                  <span className="text-sm text-white/50">Connect wallet to trade</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          MARKETPLACE GRID — Modern Layout
      ═══════════════════════════════════════ */}
      <section className="relative px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          {isLoading ? (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="h-12 w-72 rounded-lg bg-gradient-to-r from-white/10 to-white/5 shimmer" />
                <div className="h-6 w-96 rounded-lg bg-gradient-to-r from-white/5 to-white/[0.01] shimmer" />
              </div>
              <NftGridSkeleton count={8} />
            </div>
          ) : listings.length > 0 ? (
            <div className="space-y-12 animate-fade-in">
              {/* Collections Header */}
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-3">
                    {filteredAndSortedListings.length === listings.length 
                      ? 'Collections' 
                      : `Search Results`}
                  </h2>
                  <p className="text-white/60 text-lg">
                    {filteredAndSortedListings.length} {filteredAndSortedListings.length === 1 ? 'item' : 'items'} 
                    {searchQuery ? ` matching "${searchQuery}"` : ' available'}
                  </p>
                </div>

                {/* Premium Toolbar */}
                <div className="relative group border border-white/15 rounded-xl bg-gradient-to-r from-white/[0.06] via-white/[0.03] to-white/[0.01] p-5 backdrop-blur-xl hover:border-white/25 hover:from-white/[0.08] transition-all duration-300">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/15 to-purple-500/8 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300 -z-10" />

                  <div className="relative flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                    {/* Search Input */}
                    <div className="relative flex-1 group/search">
                      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400/50 transition-colors group-hover/search:text-cyan-300" />
                      <input
                        type="text"
                        placeholder="Search NFTs by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-white/20 bg-white/[0.05] py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/40 focus:border-cyan-300/60 focus:ring-1 focus:ring-cyan-300/30 focus:bg-white/[0.08] focus:outline-none transition-all duration-200 backdrop-blur-sm hover:border-white/30"
                      />
                    </div>

                    {/* Controls - Sort & View Toggle */}
                    <div className="flex gap-3 items-center flex-wrap md:flex-nowrap">
                      {/* Sort Dropdown */}
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'newest' | 'price-low' | 'price-high')}
                        className="rounded-lg border border-white/20 bg-white/[0.05] px-4 py-3 text-sm text-white/80 hover:bg-white/[0.08] hover:border-white/30 focus:border-cyan-300/60 focus:ring-1 focus:ring-cyan-300/30 focus:bg-white/[0.08] focus:outline-none transition-all duration-200 appearance-none cursor-pointer pr-10 backdrop-blur-sm"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 12 12'%3E%3Cpath fill='%2322d3ee' opacity='0.6' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                          backgroundPosition: 'right 10px center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      >
                        <option value="newest">Newest First</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                      </select>

                      {/* View Layout Toggle */}
                      <div className="flex items-center gap-1 rounded-lg border border-white/20 bg-white/[0.05] p-1 backdrop-blur-sm hover:border-white/30 transition-all">
                        <button
                          onClick={() => setGridView('comfortable')}
                          className={`rounded-md p-2.5 transition-all duration-200 ${
                            gridView === 'comfortable'
                              ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/50 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                              : 'text-white/40 hover:text-white/70'
                          }`}
                          title="Comfortable view"
                        >
                          <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setGridView('compact')}
                          className={`rounded-md p-2.5 transition-all duration-200 ${
                            gridView === 'compact'
                              ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/50 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                              : 'text-white/40 hover:text-white/70'
                          }`}
                          title="Compact view"
                        >
                          <Grid3x3 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* NFT Grid */}
              {filteredAndSortedListings.length > 0 ? (
                <div
                  className={`grid gap-6 ${gridView === 'comfortable'
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
                          className="w-full font-semibold text-sm md:text-base bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black border-0 shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] transition-all duration-300"
                          onClick={() => handleBuy(listing)}
                          disabled={!account || listing.seller === account?.address || buyingId === listing.nftId}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {!account
                            ? 'Connect Wallet'
                            : listing.seller === account?.address
                              ? 'Your Item'
                              : buyingId === listing.nftId
                                ? 'Processing...'
                                : `Buy ${listing.price} SUI`}
                        </Button>
                      </NftCard>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-gradient-to-br from-white/[0.05] to-transparent p-12 text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-lg" />
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-cyan-500/10 to-transparent">
                      <Search className="h-10 w-10 text-cyan-300/50" />
                    </div>
                  </div>
                  <p className="text-xs uppercase tracking-wider text-cyan-400/70 font-semibold mb-2">No Results</p>
                  <p className="text-lg font-semibold text-white/80 mb-1">Nothing matches your search</p>
                  <p className="text-sm text-white/50 max-w-sm">Try adjusting your filters or search for a different NFT name</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex min-h-[600px] flex-col items-center justify-center p-12 text-center">
              <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-lg" />
                <div className="relative flex h-28 w-28 items-center justify-center rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-cyan-500/10 to-transparent">
                  <ShoppingCart className="h-14 w-14 text-cyan-300/40" />
                </div>
              </div>

              <p className="text-sm uppercase tracking-wider text-cyan-400/70 font-semibold mb-3">No listings yet</p>
              <h2 className="font-display text-5xl md:text-6xl font-black text-white mb-6">Marketplace Ready</h2>
              <p className="mt-4 max-w-md text-base text-white/60 leading-relaxed">
                Start building your NFT collection. Mint your first item or explore the ecosystem.
              </p>

              {account ? (
                <Button
                  size="lg"
                  className="mt-10 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 px-8 py-4 font-bold text-black hover:from-cyan-400 hover:to-cyan-300 border-0 shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all duration-300"
                  onClick={() => { window.location.href = '/mint'; }}
                >
                  <Package className="mr-2 h-5 w-5" />
                  Mint Your First NFT
                </Button>
              ) : (
                <p className="mt-10 text-sm text-white/40 font-medium">
                  Connect your wallet to get started
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

