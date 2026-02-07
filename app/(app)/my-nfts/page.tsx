'use client';

import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Tag, X, Wallet } from 'lucide-react';

import { useMarketplace } from '@/app/components/providers';
import { NftCard } from '@/app/components/nft-card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';

export default function MyNftsPage() {
  const { nfts, listNft, delistNft } = useMarketplace();
  const account = useCurrentAccount();
  const [selectedNft, setSelectedNft] = useState<string | null>(null);
  const [price, setPrice] = useState('');

  const myNfts = nfts.filter((nft) => nft.owner === account?.address);

  const handleList = () => {
    if (!selectedNft || !price) return;
    const nft = myNfts.find((n) => n.id === selectedNft);
    if (!nft) return;
    listNft(nft, parseFloat(price));
    setSelectedNft(null);
    setPrice('');
  };

  const handleDelist = (id: string) => {
    delistNft(id);
  };

  if (!account) {
    return (
      <div className="h-full w-full space-y-8">
        <div className="flex min-h-[500px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 p-12 text-center">
          <Wallet className="mb-6 h-16 w-16 text-muted-foreground/70" />
          <h2 className="text-2xl font-bold">Connect Wallet</h2>
          <p className="mt-3 text-muted-foreground">
            Connect your wallet to view your NFTs
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full space-y-8">
      {myNfts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 justify-items-center sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {myNfts.map((nft) => (
            <NftCard key={nft.id} nft={nft}>
              {nft.isListed ? (
                <Button
                  variant="outline"
                  className="w-full font-semibold"
                  size="lg"
                  onClick={() => handleDelist(nft.id)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Delist
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
            </NftCard>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[500px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 p-12 text-center">
          <Tag className="mb-6 h-16 w-16 text-muted-foreground/70" />
          <h2 className="text-2xl font-bold">No NFTs yet</h2>
          <p className="mt-3 text-muted-foreground">
            Mint your first NFT to get started
          </p>
        </div>
      )}

      <Dialog open={!!selectedNft} onOpenChange={() => setSelectedNft(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-bold">List NFT for Sale</DialogTitle>
            <DialogDescription>
              Set a price in SUI tokens for your NFT.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label htmlFor="price" className="text-sm font-semibold">Price (SUI)</Label>
              <Input
                id="price"
                type="number"
                placeholder="Enter price (e.g., 10.5)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="0.01"
                className="h-11"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="lg" onClick={() => setSelectedNft(null)}>
              Cancel
            </Button>
            <Button size="lg" onClick={handleList} disabled={!price || parseFloat(price) <= 0}>
              List for Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
