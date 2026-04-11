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

      // ito yung Sign and Execute Transaction
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
      // ito yung try and catch para sa delist trancaction
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
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.09]">
              <Wallet className="h-7 w-7 text-white/30" />
            </div>
          </div>
          <h1 className="text-2xl font-bold font-display text-white">Wallet Required</h1>
          <p className="text-sm text-white/40">
            Connect your wallet to access and manage your NFT collection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-[hsl(var(--bg-void))]">
      {/* ═══════════════════════════════════════
          PREMIUM HERO SECTION
      ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-white/10 px-4 pb-16 pt-20 md:px-8 md:pb-24 md:pt-28">
        {/* Animated background glows */}
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-gradient-to-br from-cyan-500/12 via-purple-500/8 to-transparent blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -left-40 h-72 w-72 rounded-full bg-gradient-to-tr from-indigo-600/10 via-transparent to-transparent blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative mx-auto max-w-7xl">
          {/* Premium badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/8 px-3.5 py-2 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">Your Collection</span>
          </div>

          {/* Main content */}
          <div className="flex flex-col justify-between gap-12 lg:flex-row lg:items-end">
            <div className="space-y-6 flex-1">
              <div className="space-y-3">
                <h1 className="font-display text-5xl md:text-6xl font-black leading-[1.1] tracking-tighter text-white">
                  My
                  <br />
                  <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">NFTs</span>
                </h1>
              </div>
              <p className="max-w-lg text-base text-white/70 leading-relaxed font-light">
                Manage your exclusive digital assets. List for sale, burn, or hold for future opportunities.
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 w-full lg:w-auto">
              <div className="group border border-cyan-500/20 rounded-xl bg-gradient-to-br from-cyan-500/5 to-transparent p-4 backdrop-blur-sm hover:border-cyan-400/40 hover:bg-cyan-500/10 transition-all duration-300">
                <p className="text-xs uppercase tracking-wider text-cyan-400/70 font-semibold mb-2">Total</p>
                <p className="text-3xl md:text-4xl font-bold text-cyan-300">{myNfts.length}</p>
              </div>
              <div className="group border border-purple-500/20 rounded-xl bg-gradient-to-br from-purple-500/5 to-transparent p-4 backdrop-blur-sm hover:border-purple-400/40 hover:bg-purple-500/10 transition-all duration-300">
                <p className="text-xs uppercase tracking-wider text-purple-400/70 font-semibold mb-2">Listed</p>
                <p className="text-3xl md:text-4xl font-bold text-purple-300">{myNfts.filter(n => n.isListed).length}</p>
              </div>
              <div className="group border border-white/20 rounded-xl bg-gradient-to-br from-white/5 to-transparent p-4 backdrop-blur-sm hover:border-white/40 hover:bg-white/10 transition-all duration-300">
                <p className="text-xs uppercase tracking-wider text-white/50 font-semibold mb-2">Unlisted</p>
                <p className="text-3xl md:text-4xl font-bold text-white">{myNfts.filter(n => !n.isListed).length}</p>
              </div>
            </div>
          </div>

          {/* Wallet info pill */}
          <div className="mt-10 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 backdrop-blur-sm">
            <div className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300">
              <div className="h-1 w-1 rounded-full bg-white" />
            </div>
            <p suppressHydrationWarning className="font-mono text-xs font-medium text-white/80">
              {account.address.slice(0, 10)}...{account.address.slice(-6)}
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          COLLECTION CONTENT
      ═══════════════════════════════════════ */}
      <section className="relative flex-1 px-4 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-7xl">
          {myNfts.length > 0 ? (
            <div className="space-y-8 animate-fade-in">
              {/* Header with description */}
              <div className="space-y-2">
                <h2 className="font-display text-3xl md:text-4xl font-black text-white">Your Collection</h2>
                <p className="text-white/60">Manage {myNfts.length} {myNfts.length === 1 ? 'item' : 'items'} in your wallet</p>
              </div>

              {/* Filter pills - Status */}
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 backdrop-blur-sm">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300">All Items</span>
                </div>
                <div className="px-3 py-1.5 rounded-full border border-white/20 bg-white/[0.04] hover:bg-white/[0.08] transition-all cursor-pointer backdrop-blur-sm">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Listed ({myNfts.filter(n => n.isListed).length})</span>
                </div>
                <div className="px-3 py-1.5 rounded-full border border-white/20 bg-white/[0.04] hover:bg-white/[0.08] transition-all cursor-pointer backdrop-blur-sm">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Unlisted ({myNfts.filter(n => !n.isListed).length})</span>
                </div>
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

                          // ito yung button 
                          <Button
                            className="w-full font-semibold"
                            size="lg"
                            onClick={() => setSelectedNft(nft.id)}
                          >
                            <Tag className="mr-2 h-4 w-4" />
                            List for Sale
                          </Button>
                        )}
                        {/* ito yung NFT Listed */}
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
            <div className="flex min-h-[500px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-gradient-to-br from-white/[0.05] to-transparent p-12 text-center">
              <div className="mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-lg" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-cyan-500/10 to-transparent">
                  <Package className="h-12 w-12 text-cyan-300/40" />
                </div>
              </div>
              <p className="text-xs uppercase tracking-wider text-cyan-400/70 font-semibold mb-2">Empty Collection</p>
              <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-4">No NFTs Yet</h2>
              <p className="max-w-md text-base text-white/60 leading-relaxed mb-8">
                Start building your NFT Marketplace or portfolio by minting your first exclusive digital asset.
              </p>
              <Button 
                size="lg" 
                className="rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white border-0 shadow-[0_0_20px_rgba(13,219,208,0.3)] hover:shadow-[0_0_30px_rgba(13,219,208,0.5)] transition-all duration-300"
                onClick={() => window.location.href = '/mint'}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Mint Your First NFT 
              </Button>
            </div>
          )}
        </div>
      </section>
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

          {/* ito yung Footer  */}
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

          {/* ito yung DialogFooter */}
          <DialogFooter className="gap-2 sm:gap-0">
            {/* ito yung Button  */}
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