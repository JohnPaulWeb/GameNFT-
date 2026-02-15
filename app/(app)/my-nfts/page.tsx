'use client';

import { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Tag, X, Flame, Wallet, Sparkles } from 'lucide-react';
import { Transaction } from '@mysten/sui/transactions';

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

    setIsBurning(true);

    try {
      const tx = new Transaction();

      // entry fun burn(nft: NFT)
      // ✅ tx.object() with the NFT's on-chain object ID
      // No typeArguments needed for burn — it takes NFT directly by value
      tx.moveCall({
        target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::burn`,
        arguments: [
          tx.object(burnNftId),
        ],
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
            toast({ variant: 'destructive', title: 'Burn Failed', description: error?.message || 'Transaction failed' });
            setIsBurning(false);
          },
        }
      );
    } catch (error) {
      console.error('Burn tx error:', error);
      toast({ variant: 'destructive', title: 'Transaction Error', description: error instanceof Error ? error.message : 'Failed.' });
      setIsBurning(false);
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
      // 1 SUI = 1_000_000_000 MIST
      const priceInMist = BigInt(Math.floor(priceNumber * 1_000_000_000));

      const tx = new Transaction();

      // entry fun list<T: key + store, SUI>(marketplace, nft, price, ctx)
      // ✅ tx.pure.u64() for the price — avoids bcs import type confusion
      tx.moveCall({
        target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::list`,
        typeArguments: [
          `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::NFT`,
          '0x2::sui::SUI',
        ],
        arguments: [
          tx.object(CONTRACTS.MARKETPLACE_ID),
          tx.object(nft.id),
          tx.pure.u64(priceInMist),
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
            toast({ variant: 'destructive', title: 'Listing Failed', description: error?.message || 'Transaction failed' });
            setIsListing(false);
          },
        }
      );
    } catch (error) {
      console.error('List tx error:', error);
      toast({ variant: 'destructive', title: 'Transaction Error', description: error instanceof Error ? error.message : 'Failed.' });
      setIsListing(false);
    }
  };

  // ===== DELIST =====
  const handleDelist = (nftId: string) => {
    setDelistingId(nftId);

    try {
      const tx = new Transaction();

      // entry fun delist_and_take<T: key + store, SUI>(marketplace, nft_id, ctx)
      // ✅ nft_id is type ID (32 bytes) — use tx.pure.id() 
      tx.moveCall({
        target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::delist_and_take`,
        typeArguments: [
          `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::NFT`,
          '0x2::sui::SUI',
        ],
        arguments: [
          tx.object(CONTRACTS.MARKETPLACE_ID),
          tx.pure.id(nftId),   // ✅ nft_id: ID — must be pure.id() not tx.object()
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
            toast({ variant: 'destructive', title: 'Delist Failed', description: error?.message || 'Transaction failed' });
            setDelistingId(null);
          },
        }
      );
    } catch (error) {
      console.error('Delist tx error:', error);
      toast({ variant: 'destructive', title: 'Transaction Error', description: error instanceof Error ? error.message : 'Failed.' });
      setDelistingId(null);
    }
  };

  if (!account) {
    return (
      <div className="h-full w-full space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">My NFTs</h1>
          <p className="text-muted-foreground">
            Manage and list your NFT collection
          </p>
        </div>
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 p-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Wallet className="h-10 w-10 text-muted-foreground/70" />
          </div>
          <h2 className="mt-6 text-2xl font-bold">Wallet Not Connected</h2>
          <p className="mt-2 max-w-sm text-muted-foreground">
            Please connect your wallet to view and manage your NFT collection
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My NFTs</h1>
        <p className="text-muted-foreground">
          Manage and list your NFT collection
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total NFTs</p>
            <p className="text-2xl font-bold">{myNfts.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
            <Tag className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Listed</p>
            <p className="text-2xl font-bold">{myNfts.filter(n => n.isListed).length}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-muted-foreground">Your Wallet</p>
            <p className="truncate font-mono text-sm font-semibold">
              {account.address.slice(0, 8)}...{account.address.slice(-6)}
            </p>
          </div>
        </div>
      </div>

      {/* NFT Grid */}
      {myNfts.length > 0 ? (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your Collection</h2>
            <span className="text-sm text-muted-foreground">
              {myNfts.length} {myNfts.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-6 justify-items-center sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {myNfts.map((nft) => (
            <NftCard key={nft.id} nft={nft}>
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
                    className="w-full font-semibold shadow-sm"
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
                    className="w-full font-semibold"
                    size="lg"
                    onClick={() => setBurnNftId(nft.id)}
                  >
                    <Flame className="mr-2 h-4 w-4" />
                    Burn NFT
                  </Button>
                )}
              </div>
            </NftCard>
          ))}
        </div>
        </div>
      ) : (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 p-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Package className="h-10 w-10 text-muted-foreground/70" />
          </div>
          <h2 className="mt-6 text-2xl font-bold">No NFTs Yet</h2>
          <p className="mt-2 max-w-sm text-muted-foreground">
            Start building your collection by minting your first NFT
          </p>
          <Button className="mt-6" size="lg" onClick={() => window.location.href = '/mint'}>
            <Sparkles className="mr-2 h-4 w-4" />
            Mint Your First NFT
          </Button>
        </div>
      )}

      {/* LIST DIALOG */}
      <Dialog open={!!selectedNft} onOpenChange={() => { setSelectedNft(null); setPrice(''); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-bold">List NFT for Sale</DialogTitle>
            <DialogDescription>
              Set a price in SUI. The NFT will be transferred into the marketplace contract.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label htmlFor="price" className="text-sm font-semibold">Price (SUI)</Label>
              <Input
                id="price"
                type="number"
                placeholder="Enter price (e.g., 1.5)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0.000000001"
                step="0.1"
                className="h-11"
                disabled={isListing}
              />
              <p className="text-xs text-muted-foreground">A 2% marketplace fee applies on sale.</p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="lg" onClick={() => { setSelectedNft(null); setPrice(''); }} disabled={isListing}>
              Cancel
            </Button>
            <Button size="lg" onClick={handleList} disabled={isListing || !price || parseFloat(price) <= 0}>
              {isListing ? 'Listing on Blockchain...' : 'List for Sale'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* BURN CONFIRMATION DIALOG */}
      <Dialog open={!!burnNftId} onOpenChange={() => setBurnNftId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-bold text-red-600">🔥 Burn NFT?</DialogTitle>
            <DialogDescription>
              This will permanently destroy your NFT on the blockchain. This action <strong>cannot be undone</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4 dark:bg-red-950/20 my-2">
            <p className="text-sm text-red-800 dark:text-red-200">
              ⚠️ The NFT will be deleted forever. Make sure it is NOT currently listed in the marketplace.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="lg" onClick={() => setBurnNftId(null)} disabled={isBurning}>
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