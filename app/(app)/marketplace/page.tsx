'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { ShoppingCart, Wallet, TrendingUp, Package, RefreshCw } from 'lucide-react';
import { Transaction } from '@mysten/sui/transactions';
import { bcs } from '@mysten/sui/bcs';

import { Button } from '@/app/components/ui/button';
import { NftCard } from '@/app/components/nft-card';
import { useToast } from '@/app/hooks/use-toast';
import { CONTRACTS } from '@/app/components/contracts';

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
    <div className="w-full min-h-screen flex flex-col bg-[hsl(var(--background))]">
      {/* Hero Section */}
      <div className="relative overflow-hidden px-4 md:px-8 py-12 md:py-20">
        {/* Ambient background glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full opacity-10" style={{
            background: 'radial-gradient(circle, rgba(0, 240, 255, 0.4), transparent)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }} />
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
                Premium NFT
                <span className="block bg-gradient-to-r from-cyan-300 via-cyan-400 to-cyan-300 bg-clip-text text-transparent">
                  Marketplace
                </span>
              </h1>
              <p className="text-lg text-[hsl(var(--text-secondary))] max-w-2xl leading-relaxed">
                Discover, mint, and trade exclusive gaming NFTs on the Sui blockchain. Experience premium Web3 trading.
              </p>
            </div>
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

      {/* Stats Section */}
      <div className="px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {/* Listed Items Stat */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl p-6 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-lg">
              <div className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 rounded-2xl blur-xl"
                style={{
                  background: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.1) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--text-secondary))] mb-2">Listed Items</p>
                  <p className="text-3xl md:text-4xl font-bold font-display text-white">{listings.length}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/20">
                  <Package className="h-6 w-6 text-cyan-300" />
                </div>
              </div>
            </div>

            {/* Total Volume Stat */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl p-6 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-lg">
              <div className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 rounded-2xl blur-xl"
                style={{
                  background: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.1) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--text-secondary))] mb-2">Total Volume</p>
                  <p className="text-3xl md:text-4xl font-bold font-display text-white">
                    {listings.reduce((sum, l) => sum + l.price, 0).toFixed(0)}
                  </p>
                  <p className="text-xs text-cyan-300 mt-1">SUI</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/20">
                  <TrendingUp className="h-6 w-6 text-cyan-300" />
                </div>
              </div>
            </div>

            {/* Connected Wallet Stat */}
            {account && (
              <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl p-6 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-lg col-span-1 sm:col-span-2 lg:col-span-1">
                <div className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 rounded-2xl blur-xl"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.1) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }}
                />
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[hsl(var(--text-secondary))] mb-2">Connected Wallet</p>
                    <p className="truncate font-mono text-sm font-semibold text-cyan-300">
                      {account.address.slice(0, 8)}...{account.address.slice(-6)}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex-shrink-0">
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
            <div className="flex min-h-[500px] items-center justify-center">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                    <div className="absolute inset-0 rounded-full border-t-2 border-cyan-400 animate-spin" />
                  </div>
                </div>
                <div>
                  <p className="text-lg text-white font-semibold">Loading Marketplace</p>
                  <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Querying blockchain...</p>
                </div>
              </div>
            </div>
          ) : listings.length > 0 ? (
            <div className="space-y-6 animate-fade-in">
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold font-display text-white">Available NFTs</h2>
                  <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
                    {listings.length} {listings.length === 1 ? 'item' : 'items'} available for trading
                  </p>
                </div>
              </div>

              {/* NFT Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map((listing, index) => (
                  <div key={listing.nftId} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-up">
                    <NftCard
                      nft={{
                        id: listing.nftId,
                        name: listing.name,
                        description: listing.description,
                        imageUrl: listing.imageUrl,
                        owner: listing.seller,
                        isListed: true,
                        price: listing.price,
                        rarity: 'common',
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
                  Connect your wallet to start trading
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}