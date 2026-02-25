'use client';

import { useState, useEffect, useCallback } from 'react';
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
      // Query ListNFTEvents to find all NFTs that were ever listed
      const result = await client.queryEvents({
        query: {
          MoveEventType: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::ListNFTEvent`,
        },
        limit: 50,
      });

      console.log('=== MARKETPLACE DEBUG ===');
      console.log('Raw events:', result.data);

      if (result.data.length === 0) {
        console.log('No ListNFTEvents found. Either nothing has been listed yet, or PACKAGE_ID/MODULE_NAME is wrong.');
        console.log('PACKAGE_ID:', CONTRACTS.PACKAGE_ID);
        console.log('MODULE_NAME:', CONTRACTS.MODULE_NAME);
        setListings([]);
        setIsLoading(false);
        return;
      }

      // Extract NFT IDs — handle both "0x..." string and { id: "0x..." } object formats
      const listedItems = result.data.map((event: any) => {
        const fields = event.parsedJson;
        console.log('Event fields:', fields);

        // nft_id can come as a plain string or as { id: "0x..." }
        const rawNftId = fields?.nft_id;
        const nftId = typeof rawNftId === 'string'
          ? rawNftId
          : rawNftId?.id ?? rawNftId?.bytes ?? '';

        // normalize to 0x prefix
        const normalizedId = nftId.startsWith('0x') ? nftId : `0x${nftId}`;

        return {
          nftId: normalizedId,
          seller: fields?.seller ?? '',
          priceInMist: BigInt(fields?.price ?? 0),
        };
      }).filter(item => item.nftId && item.nftId !== '0x');

      console.log('Parsed listed items:', listedItems);

      // For each item, check if NFT is still wrapped (still listed)
      const activeListings: ListedNFT[] = [];

      for (const item of listedItems) {
        try {
          const nftObject = await client.getObject({
            id: item.nftId,
            options: { showContent: true, showOwner: true, showType: true },
          });
        

          console.log(`NFT ${item.nftId} owner:`, nftObject.data?.owner);

          if (!nftObject.data) continue;

          const owner = nftObject.data.owner;

          // ObjectOwner means it's wrapped inside a Listing object = still listed
          const isStillListed =
            owner &&
            typeof owner === 'object' &&
            'ObjectOwner' in owner;

          if (!isStillListed) {
            console.log(`NFT ${item.nftId} is no longer listed (owner: ${JSON.stringify(owner)})`);
            continue;
          }

          const listingId = (owner as any).ObjectOwner as string;
          console.log(`NFT ${item.nftId} is listed inside Listing object: ${listingId}`);

          // Fetch the Listing object to get price and seller
          const listingObject = await client.getObject({
            id: listingId,
            options: { showContent: true },
          });

          console.log('Listing object:', listingObject.data?.content);

          const listingFields = (listingObject.data?.content as any)?.fields;
          const nftFields = (nftObject.data?.content as any)?.fields;

          console.log('Listing fields:', listingFields);
          console.log('NFT fields:', nftFields);

          if (!listingFields || !nftFields) continue;

          const priceInMist = BigInt(listingFields.price ?? item.priceInMist);

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
        } catch (err) {
          console.warn('Error processing NFT', item.nftId, err);
        }
      }

      console.log('Final active listings:', activeListings);
      console.log('=== END DEBUG ===');
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

  const handleBuy = async (listing: ListedNFT) => {
    if (!account) {
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
          onSuccess: (result: any) => {
            console.log('Buy successful!', result);
            toast({
              title: 'Purchase Successful! 🎉',
              description: `You bought ${listing.name} for ${listing.price} SUI!`,
            });
            setTimeout(() => fetchListings(), 1500);
            setBuyingId(null);
          },
          onError: (error: any) => {
            console.error('Buy failed:', error);
            const msg = error?.message ?? 'Transaction failed';
            toast({
              variant: 'destructive',
              title: 'Purchase Failed',
              description: msg.includes('InsufficientCoinBalance')
                ? 'Not enough SUI in your wallet.'
                : msg,
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

  return (
    <div className="w-full min-h-screen flex flex-col relative">
      {/* Hero Section */}
      <div className="relative overflow-hidden px-4 md:px-8 py-12 md:py-20">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div 
            className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(16, 240, 252, 0.5), rgba(99, 102, 241, 0.3), transparent)',
              animation: 'aurora 15s ease-in-out infinite',
            }} 
          />
          <div 
            className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.4), rgba(236, 72, 153, 0.2), transparent)',
              animation: 'glow-pulse 10s ease-in-out infinite',
              animationDelay: '3s',
            }} 
          />
        </div>
        
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header with title and refresh */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/30">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-semibold text-cyan-300">Live Marketplace</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold font-display leading-tight tracking-tight text-white">
                <span className="block text-2xl md:text-3xl font-normal text-[hsl(var(--text-secondary))] mb-2">Makerspace Innovhub</span>
                <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                  NFT Marketplace
                </span>
              </h1>
              <p className="text-lg text-[hsl(var(--text-secondary))] max-w-2xl leading-relaxed">
                Discover, collect, and trade exclusive digital assets on the Sui blockchain
              </p>
            </div>

            {/* ito yung button for Loading   */}
            <Button
              variant="outline"
              size="lg"
              onClick={fetchListings}
              disabled={isLoading}
              className="w-fit"
            >
              <RefreshCw className={`mr-2 h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing' : 'Refresh'}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section - Enhanced */}
      <div className="px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {/* Listed Items Stat */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl p-6 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1">
              <div className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 rounded-2xl blur-xl"
                style={{
                  background: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.2) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-2">Listed Items</p>
                  <p className="text-3xl md:text-4xl font-bold font-display text-white">{listings.length}</p>
                  <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">Items available</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/30 to-cyan-500/10 border border-cyan-400/30">
                  <Package className="h-6 w-6 text-cyan-300" />
                </div>
              </div>
            </div>

            {/* Total Volume Stat */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl p-6 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1">
              <div className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 rounded-2xl blur-xl"
                style={{
                  background: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.2) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-2">Total Volume</p>
                  <p className="text-3xl md:text-4xl font-bold font-display text-white">
                    {listings.reduce((sum, l) => sum + l.price, 0).toFixed(0)}
                  </p>
                  <p className="text-xs text-cyan-300 mt-1">SUI</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/30 to-cyan-500/10 border border-cyan-400/30">
                  <TrendingUp className="h-6 w-6 text-cyan-300" />
                </div>
              </div>
            </div>

            {/* Floor Price Stat */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl p-6 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1">
              <div className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 rounded-2xl blur-xl"
                style={{
                  background: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.2) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2">Floor Price</p>
                  <p className="text-3xl md:text-4xl font-bold font-display text-white">
                    {listings.length > 0 ? Math.min(...listings.map(l => l.price)).toFixed(2) : '0'}
                  </p>
                  <p className="text-xs text-amber-300 mt-1">SUI</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/30 to-orange-500/10 border border-amber-400/30">
                  <TrendingUp className="h-6 w-6 text-amber-300" />
                </div>
              </div>
            </div>

            {/* Connected Wallet Stat */}
            {account && (
              <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl p-6 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1">
                <div className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 rounded-2xl blur-xl"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.2) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }}
                />
                <div className="relative z-10 flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-2">Connected Wallet</p>
                    <p className="truncate font-mono text-sm font-semibold text-white">
                      {account.address.slice(0, 8)}...
                    </p>
                    <p className="text-xs text-[hsl(var(--text-secondary))] mt-1 truncate">
                      {account.address.slice(-8)}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/30 to-cyan-500/10 border border-cyan-400/30 flex-shrink-0">
                    <Wallet className="h-6 w-6 text-cyan-300" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="h-8 w-48 rounded-lg bg-white/10 shimmer" />
                <div className="h-4 w-64 rounded-lg bg-white/5 shimmer" />
              </div>
              <NftGridSkeleton count={8} />
            </div>
          ) : listings.length > 0 ? (
            <div className="space-y-6 animate-fade-in">
              {/* Search and Filter Bar */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl p-4 md:p-5 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--text-muted))]" />
                    <input
                      type="text"
                      placeholder="Search NFTs by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/15 bg-gradient-to-r from-white/8 to-white/3 backdrop-blur-sm text-white placeholder:text-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all font-medium"
                    />
                  </div>

                  {/* Sort */}
                  <div className="flex gap-3">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-4 py-3 rounded-xl border border-white/15 bg-gradient-to-r from-white/8 to-white/3 backdrop-blur-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all cursor-pointer"
                    >
                      <option value="newest" className="bg-[hsl(var(--bg-tertiary))]">Newest First</option>
                      <option value="price-low" className="bg-[hsl(var(--bg-tertiary))]">Price: Low to High</option>
                      <option value="price-high" className="bg-[hsl(var(--bg-tertiary))]">Price: High to Low</option>
                    </select>

                    {/* Grid View Toggle */}
                    <div className="flex gap-2 p-1.5 rounded-xl border border-white/15 bg-gradient-to-r from-white/8 to-white/3 backdrop-blur-sm">
                      <button
                        onClick={() => setGridView('comfortable')}
                        className={`p-2.5 rounded-lg transition-all font-medium text-sm ${
                          gridView === 'comfortable'
                            ? 'bg-gradient-to-r from-cyan-500/40 to-cyan-500/20 text-cyan-200 border border-cyan-400/30 shadow-lg shadow-cyan-500/20'
                            : 'text-[hsl(var(--text-muted))] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <LayoutGrid className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setGridView('compact')}
                        className={`p-2.5 rounded-lg transition-all font-medium text-sm ${
                          gridView === 'compact'
                            ? 'bg-gradient-to-r from-cyan-500/40 to-cyan-500/20 text-cyan-200 border border-cyan-400/30 shadow-lg shadow-cyan-500/20'
                            : 'text-[hsl(var(--text-muted))] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Grid3x3 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-semibold text-[hsl(var(--text-secondary))] mr-1">Quick filters:</span>
                  <button className="px-3 py-1.5 rounded-full text-xs font-semibold text-cyan-200 bg-gradient-to-r from-cyan-500/30 to-cyan-600/20 border border-cyan-400/40 hover:from-cyan-500/40 hover:to-cyan-600/30 hover:shadow-lg hover:shadow-cyan-500/20 transition-all">Trending</button>
                  <button className="px-3 py-1.5 rounded-full text-xs font-semibold text-white/90 bg-gradient-to-r from-white/10 to-white/5 border border-white/20 hover:from-white/15 hover:to-white/10 hover:shadow-lg hover:shadow-white/10 transition-all">Under 5 SUI</button>
                  <button className="px-3 py-1.5 rounded-full text-xs font-semibold text-white/90 bg-gradient-to-r from-white/10 to-white/5 border border-white/20 hover:from-white/15 hover:to-white/10 hover:shadow-lg hover:shadow-white/10 transition-all">New Drops</button>
                  <button className="px-3 py-1.5 rounded-full text-xs font-semibold text-amber-200 bg-gradient-to-r from-amber-500/30 to-orange-600/20 border border-amber-400/40 hover:from-amber-500/40 hover:to-orange-600/30 hover:shadow-lg hover:shadow-amber-500/20 transition-all">Legendary</button>
                </div>
              </div>

              {/* Results Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold font-display text-white">Available NFTs</h2>
                  <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
                    {(() => {
                      const filtered = listings.filter(l => 
                        l.name.toLowerCase().includes(searchQuery.toLowerCase())
                      );
                      return `${filtered.length} ${filtered.length === 1 ? 'item' : 'items'} ${searchQuery ? 'found' : 'available'}`;
                    })()}
                  </p>
                </div>
              </div>
              
              {/* NFT's Grid */}
              <div className={`grid gap-6 ${
                gridView === 'comfortable'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
              }`}>
                {listings.map((listing, index) => (
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
                        disabled={
                          !account ||
                          listing.seller === account?.address ||
                          buyingId === listing.nftId
                        }
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
            </div>
          ) : (
            <div className="flex min-h-[500px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-white/10 bg-gradient-to-br from-white/3 to-transparent p-12 text-center animate-fade-in">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-cyan-400/10 border border-cyan-400/20 mb-6">
                <ShoppingCart className="h-12 w-12 text-cyan-300/50" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-white">Marketplace Empty</h2>
              <p className="mt-3 max-w-md text-[hsl(var(--text-secondary))] text-lg">
                Be the first to list your exclusive gaming NFTs on our premium marketplace.
              </p>
              {account && (
                <Button 
                  size="lg" 
                  className="mt-8"
                  onClick={() => window.location.href = '/mint'}
                >
                  <Package className="mr-2 h-5 w-5" />
                  Mint Your First NFT
                </Button>
              )}
              {!account && (
                <p className="mt-8 text-sm text-[hsl(var(--text-secondary))]">
                  Connect your wallet to start your Journey
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}