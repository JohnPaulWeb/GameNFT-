'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Sparkles } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/app/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { useToast } from '@/app/hooks/use-toast';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';
import { useMarketplace } from '@/app/components/providers';
import { NFT } from '@/app/lib/types';

const mintableItems = PlaceHolderImages.map((img) => ({
  id: img.id,
  name: `SuiPlay: ${img.imageHint}`,
  description: img.description,
  imageUrl: img.imageUrl,
  imageHint: img.imageHint,
}));

export default function MintPage() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const account = useCurrentAccount();
  const { toast } = useToast();
  const router = useRouter();
  const { addNft } = useMarketplace();

  const handleMint = () => {
    const item = mintableItems.find((i) => i.id === selectedItem);
    if (!item) {
      toast({
        variant: 'destructive',
        title: 'No item selected',
        description: 'Please select an item to mint.',
      });
      return;
    }

    if (!account) {
      toast({
        variant: 'destructive',
        title: 'Wallet not connected',
        description: 'Please connect your wallet to mint an NFT.',
      });
      return;
    }

    setIsMinting(true);

    // Simulate minting latency
    setTimeout(() => {
      const newNft: NFT = {
        id: uuidv4(),
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
        imageHint: item.imageHint,
        owner: account.address,
        isListed: false,
      };

      addNft(newNft);

      setIsMinting(false);
      setSelectedItem(null);
      router.push('/my-nfts');
    }, 1500);
  };

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-2xl border-2 shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold">
            Mint a New Game Item
          </CardTitle>
          <CardDescription>
            Choose an item to mint. This is currently a simulation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <label className="text-sm font-semibold">Item to Mint</label>
            <Select
              onValueChange={setSelectedItem}
              value={selectedItem || ''}
              disabled={isMinting}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select an item..." />
              </SelectTrigger>
              <SelectContent>
                {mintableItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
                
              </SelectContent>
            </Select>
            <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-4 text-sm text-muted-foreground">
              <p>
                This is a simulated minting process. No real transaction will be
                made.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/50 pt-6">
          <Button
            className="w-full font-semibold shadow-sm"
            size="lg"
            onClick={handleMint}
            disabled={isMinting || !selectedItem}
          >
            {isMinting ? (
              'Minting...'
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Mint NFT
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
