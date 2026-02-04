'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Sparkles } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useMarketplace } from '@/components/providers';
import { NFT } from '@/lib/types';

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
    <div className="animate-in fade-in-0">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">
            Mint a New Game Item
          </CardTitle>
          <CardDescription>
            Choose an item to mint. This is currently a simulation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="font-medium">Item to Mint</p>
            <Select
              onValueChange={setSelectedItem}
              value={selectedItem || ''}
              disabled={isMinting}
            >
              <SelectTrigger>
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
            <div className="text-sm text-muted-foreground p-4 bg-secondary rounded-lg">
              <p>
                This is a simulated minting process. No real transaction will be
                made.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleMint}
            disabled={isMinting || !selectedItem}
          >
            {isMinting ? (
              'Minting...'
            ) : (
              <>
                <Sparkles className="mr-2" />
                Mint NFT
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
