'use client';

import { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Tag, X, Flame, Wallet, Sparkles } from 'lucide-react';
import { Transaction } from '@mysten/sui/transactions';
import { bcs } from '@mysten/sui/bcs';

import { useMarketplace } from '@/app/components/providers';
import { NftCard } from '@/app/components/nft-card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Package } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { useToast } from '@/app/hooks/use-toast';
import { CONTRACTS } from '@/app/components/contracts';

export default function MyNftsPage() {
  const { nfts, listNft, delistNft, burnNft } = useMarketplace();
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { toast } = useToast();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [selectedNft, setSelectedNft] = useState<string | null>(null);
  const [price, setPrice] = useState('');
  const [isListing, setIsListing] = useState(false);
  const [burnNftId, setBurnNftId] = useState<string | null>(null);
  const [isBurning, setIsBurning] = useState(false);
  const [delistingId, setDelistingId] = useState<string | null>(null);

  const myNfts = nfts.filter((nft) => nft.owner === account?.address);

  // ===== BURN =====
  const handleBurn = () => {
    if (!burnNftId) return;
    const nft = myNfts.find((n) => n.id === burnNftId);
    if (!nft) return;

    // Validate the NFT ID is a proper Sui Object ID before hitting the RPC
    const cleanId = burnNftId.trim();
    const isValidSuiId = /^0x[0-9a-fA-F]{64}$/.test(cleanId);
    if (!isValidSuiId) {
      toast({
        variant: 'destructive',
        title: 'Invalid NFT Object ID',
        description:
          'The stored NFT ID is not a valid Sui Object ID. ' +
          'Please refresh the page or re-mint — the ID must start with 0x followed by 64 hex characters.',
      });
      setBurnNftId(null);
      return;
    }

    setIsBurning(true);

    try {
      console.log('Burning NFT:', cleanId);
 
      const tx = new Transaction();
      tx.moveCall({
        target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::burn`,
        arguments: [tx.object(cleanId)],
      });

      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result: any) => {
            console.log('Burn successful!', result);
            burnNft(burnNftId);
            toast({ title: 'NFT Burned 🔥', description: `${nft.name} permanently destroyed.` });
            setIsBurning(false);
            setBurnNftId(null);
          },
          onError: (error: any) => {
            console.error('Burn failed:', error);
            const msg = error?.message || error?.toString() || 'Transaction failed';
            const friendlyMsg = msg.toLowerCase().includes('objectnotfound')
              ? 'NFT not found on-chain. It may already be burned or the transaction not yet confirmed.'
              : msg.toLowerCase().includes('invalidobjectownership') || msg.toLowerCase().includes('not owned')
              ? 'You do not own this NFT, or it is still listed in the marketplace. Delist it first.'
              : msg;
            toast({
              variant: 'destructive',
              title: 'Burn Failed',
              description: friendlyMsg,
            });
            setIsBurning(false);
            setBurnNftId(null);
          },
        }
      );
    } catch (error) {
      console.error('Burn tx error:', error);
      toast({
        variant: 'destructive',
        title: 'Transaction Error',
        description: error instanceof Error ? error.message : 'Failed.',
      });
      setIsBurning(false);
      setBurnNftId(null);
    }
  };

  // ===== LIST =====
  const handleList = () => {
    if (!selectedNft || !price) return;
    const nft = myNfts.find((n) => n.id === selectedNft);
    if (!nft) return;

    const priceNumber = parseFloat(price);
    if (isNaN(priceNumber) || priceNumber <= 0) return;

    setIsListing(true);

    try {
      console.log('PACKAGE_ID:', CONTRACTS.PACKAGE_ID);
      console.log('MODULE_NAME:', CONTRACTS.MODULE_NAME);
      console.log('NETWORK:', CONTRACTS.NETWORK);
      console.log('Listing NFT:', nft.id, 'for', price, 'SUI');

      // ✅ Float-safe conversion from SUI to MIST (1 SUI = 1,000,000,000 MIST)
      const [whole = '0', frac = ''] = price.trim().split('.');
      const fracPadded = frac.padEnd(9, '0').slice(0, 9);
      const priceInMist = BigInt(whole) * BigInt('1000000000') + BigInt(fracPadded);

      console.log('Price in MIST:', priceInMist.toString());

      const tx = new Transaction();

      // entry fun list<T: key + store, SUI>(marketplace, nft, price, ctx)
      tx.moveCall({
        target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::list`,
        typeArguments: [
          `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::NFT`,
          '0x2::sui::SUI',
        ],
        arguments: [
          tx.object(CONTRACTS.MARKETPLACE_ID),
          tx.object(nft.id),
          tx.pure(bcs.u64().serialize(priceInMist)),  // ✅ Fixed: use bcs serialization
        ],
      });

      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result: any) => {
            console.log('List successful!', result);
            listNft(nft, priceNumber);
            toast({ title: 'NFT Listed! 🏷️', description: `${nft.name} listed for ${price} SUI.` });
            setIsListing(false);
            setSelectedNft(null);
            setPrice('');
          },
          onError: (error: any) => {
            console.error('List failed:', error);
            toast({ 
              variant: 'destructive', 
              title: 'Listing Failed', 
              description: error?.message || error?.toString() || 'Transaction failed' 
            });
            setIsListing(false);
          },
        }
      );
    } catch (error) {
      console.error('List tx error:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Transaction Error', 
        description: error instanceof Error ? error.message : 'Failed.' 
      });
      setIsListing(false);
    }
  };

  // ===== DELIST =====
  const handleDelist = (nftId: string) => {
    setDelistingId(nftId);

    try {
      console.log('PACKAGE_ID:', CONTRACTS.PACKAGE_ID);
      console.log('MODULE_NAME:', CONTRACTS.MODULE_NAME);
      console.log('NETWORK:', CONTRACTS.NETWORK);
      console.log('Delisting NFT:', nftId);

      const tx = new Transaction();

      // entry fun delist_and_take<T: key + store, SUI>(marketplace, nft_id, ctx)
      // ✅ nft_id is type ID — use tx.pure.id()
      tx.moveCall({
        target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::delist_and_take`,
        typeArguments: [
          `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::NFT`,
          '0x2::sui::SUI',
        ],
        arguments: [
          tx.object(CONTRACTS.MARKETPLACE_ID),
          tx.pure.id(nftId),
        ],
      });

      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result: any) => {
            console.log('Delist successful!', result);
            delistNft(nftId);
            toast({ title: 'NFT Delisted ✅', description: 'NFT returned to your wallet.' });
            setDelistingId(null);
          },
          onError: (error: any) => {
            console.error('Delist failed:', error);
            toast({ 
              variant: 'destructive', 
              title: 'Delist Failed', 
              description: error?.message || error?.toString() || 'Transaction failed' 
            });
            setDelistingId(null);
          },
        }
      );
    } catch (error) {
      console.error('Delist tx error:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Transaction Error', 
        description: error instanceof Error ? error.message : 'Failed.' 
      });
      setDelistingId(null);
    }
  };

  if (!account) {
    return (
      <div className="w-full min-h-screen flex flex-col relative">
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-cyan-400/10 border border-cyan-400/20">
                <Wallet className="h-12 w-12 text-cyan-300/50" />
              </div>
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-bold font-display text-white leading-tight">Authentication Required</h1>
              <p className="text-[hsl(var(--text-secondary))] text-lg">
                Connect your wallet to access and manage your NFT collection.
              </p>
            </div>
            <div className="pt-2">
              <p className="text-sm text-[hsl(var(--text-secondary))]">
                Use the connect button in the header to authenticate your wallet.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col relative">
      {/* Hero Section */}
      <div className="relative overflow-hidden px-4 md:px-8 py-12 md:py-20">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div 
            className="absolute top-0 right-1/4 w-[450px] h-[450px] rounded-full opacity-20 blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.5), rgba(16, 240, 252, 0.3), transparent)',
              animation: 'glow-pulse 12s ease-in-out infinite',
            }} 
          />
          <div 
            className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4), transparent)',
              animation: 'aurora 16s ease-in-out infinite',
              animationDelay: '4s',
            }} 
          />
        </div>

        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/30">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-semibold text-cyan-300">Your Collection</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-display leading-tight tracking-tight text-white">
              My NFTs
              <span className="block text-2xl md:text-3xl font-normal text-[hsl(var(--text-secondary))] mt-2">
                Manage your exclusive Digital assets 
              </span>
            </h1>
          </div>
        </div>
      </div>
      
      {/* ito yung Stats Section */}
      <div className="px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {/* Total NFTs */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl p-6 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/20">
              <div className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 rounded-2xl blur-xl"
                style={{
                  background: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.2) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-2">Total NFTs</p>
                  <p className="text-3xl md:text-4xl font-bold font-display text-white">{myNfts.length}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400/30 to-cyan-500/10 border border-cyan-400/30">
                  <Package className="h-6 w-6 text-cyan-300" />
                </div>
              </div>
            </div>

            {/* ito yung  Listed Items */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl p-6 transition-all duration-300 hover:border-indigo-400/50 hover:shadow-lg hover:shadow-indigo-500/20">
              <div className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 rounded-2xl blur-xl"
                style={{
                  background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2">Listed</p>
                  <p className="text-3xl md:text-4xl font-bold font-display text-white">{myNfts.filter(n => n.isListed).length}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-400/30 to-indigo-500/10 border border-indigo-400/30">
                  <Tag className="h-6 w-6 text-indigo-300" />
                </div>
              </div>
            </div>

            {/* ito yungc Connected Wallet */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl p-6 transition-all duration-300 hover:border-emerald-400/50 hover:shadow-lg hover:shadow-emerald-500/20 col-span-1 sm:col-span-2 lg:col-span-1">
              <div className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 rounded-2xl blur-xl"
                style={{
                  background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">Connected Wallet</p>
                  <p suppressHydrationWarning className="truncate font-mono text-sm font-semibold text-white">
                    {account.address.slice(0, 8)}...{account.address.slice(-6)}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400/30 to-emerald-500/10 border border-emerald-400/30 flex-shrink-0">
                  <Wallet className="h-6 w-6 text-emerald-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*ito yung Content Section */}
      <div className="flex-1 px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {myNfts.length > 0 ? (
            <div className="space-y-6 animate-fade-in">
              {/*ito yung  Section Header */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold font-display text-white">Your Collection</h2>
                <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
                  {myNfts.length} {myNfts.length === 1 ? 'item' : 'items'} in your wallet
                </p>
              </div>

              {/* NFT Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {myNfts.map((nft, index) => (
                  <div key={nft.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-up">
                    <NftCard nft={nft}>
                      <div className="flex flex-col gap-2 w-full">
                        {nft.isListed ? (
                          <Button
                            variant="outline"
                            className="w-full font-semibold"
                            size="lg"
                            onClick={() => handleDelist(nft.id)}
                            disabled={delistingId === nft.id}
                          >
                            <X className="mr-2 h-4 w-4" />
                            {delistingId === nft.id ? 'Delisting...' : 'Delist'}
                          </Button>
                        ) : (
                          <Button
                            className="w-full font-semibold"
                            size="lg"
                            onClick={() => setSelectedNft(nft.id)}
                          >
                            <Tag className="mr-2 h-4 w-4" />
                            List for Sale
                          </Button>
                        )}

                        {!nft.isListed && (
                          <Button
                            variant="destructive"
                            className="w-full font-semibold text-base"
                            size="lg"
                            onClick={() => setBurnNftId(nft.id)}
                          >
                            <Flame className="mr-2 h-4 w-4" />
                            Burn NFT 
                          </Button>
                        )}
                      </div>
                    </NftCard>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex min-h-[500px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-white/10 bg-gradient-to-br from-white/3 to-transparent p-12 text-center animate-fade-in">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-cyan-400/10 border border-cyan-400/20 mb-6">
                <Package className="h-12 w-12 text-cyan-300/50" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-white">Your Collection is Empty</h2>
              <p className="mt-3 max-w-md text-[hsl(var(--text-secondary))] text-lg">
                Start building your NFT portfolio by minting your first exclusive digital asset.
              </p>
              <Button 
                size="lg" 
                className="mt-8"
                onClick={() => window.location.href = '/mint'}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Mint Your First NFT

                
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ito yung LIST DIALOG */}
      <Dialog open={!!selectedNft} onOpenChange={() => { setSelectedNft(null); setPrice(''); }}>
        <DialogContent className="sm:max-w-md rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold font-display text-white">List NFT for Sale</DialogTitle>
            <DialogDescription className="text-[hsl(var(--text-secondary))]">
              Set your price in SUI. Your NFT will be transferred to the marketplace contract.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label htmlFor="price" className="text-sm font-semibold text-white">Price (SUI)</Label>
              <Input
                id="price"
                type="number"
                placeholder="Enter price (e.g., 1.5)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0.000000001"
                step="0.1"
                disabled={isListing}
              />
              <p className="text-xs text-[hsl(var(--text-secondary))]">💡 A 2% marketplace fee applies on sale.</p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" size="lg" onClick={() => { setSelectedNft(null); setPrice(''); }} disabled={isListing}>
              Cancel
            </Button>
            <Button size="lg" onClick={handleList} disabled={isListing || !price || parseFloat(price) <= 0}>
              {isListing ? (
                <>
                  <div className="animate-spin mr-2">◆</div>
                  Listing...
                </>
              ) : 'List for Sale'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/*ito yung  BURN CONFIRMATION DIALOG */}
      <Dialog open={!!burnNftId} onOpenChange={() => setBurnNftId(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold font-display text-red-500">🔥 Burn NFT?</DialogTitle>
            <DialogDescription className="text-[hsl(var(--text-secondary))]">
              This will permanently destroy your NFT on the blockchain. This action <strong className="text-red-400">cannot be undone</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border-2 border-red-500/30 bg-red-500/10 p-4 my-2">
            <p className="text-sm text-red-300">
              ⚠️ The NFT will be deleted forever. Ensure it is NOT currently listed in the marketplace.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" size="lg" onClick={() => setBurnNftId(null)} disabled={isBurning}>
              Cancel   
            </Button>
            <Button variant="destructive" size="lg" onClick={handleBurn} disabled={isBurning}>
              <Flame className="mr-2 h-4 w-4" />
              {isBurning ? 'Burning...' : 'Burn Forever'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}