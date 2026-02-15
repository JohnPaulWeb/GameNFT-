'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Sparkles, Wallet } from 'lucide-react';
import { Transaction } from '@mysten/sui/transactions';
import { bcs } from '@mysten/sui/bcs';

import { useMarketplace } from '@/app/components/providers';
import { Button } from '@/app/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { useToast } from '@/app/hooks/use-toast';
import { CONTRACTS } from '@/app/components/contracts';

export default function MintPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isMinting, setIsMinting] = useState(false);

  const account = useCurrentAccount();
  const { toast } = useToast();
  const router = useRouter();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { addNft } = useMarketplace();

  const handleMint = () => {
    if (!name.trim() || !description.trim() || !imageUrl.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in all fields (name, description, and image URL).',
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

    try {
      console.log('PACKAGE_ID:', CONTRACTS.PACKAGE_ID);
      console.log('MODULE_NAME:', CONTRACTS.MODULE_NAME);
      console.log('NETWORK:', CONTRACTS.NETWORK);
      console.log('Minting NFT:', name);

      const tx = new Transaction();
      const toBytes = (str: string) => new TextEncoder().encode(str);

      tx.moveCall({
        target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::mint`,
        arguments: [
          tx.pure(bcs.vector(bcs.u8()).serialize(toBytes(name))),
          tx.pure(bcs.vector(bcs.u8()).serialize(toBytes(description))),
          tx.pure(bcs.vector(bcs.u8()).serialize(toBytes(imageUrl))),
        ],
      });

      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result: any) => {
            console.log('Mint successful! Full result:', result);

            // ✅ Extract the real on-chain Object ID from the transaction result
            // This is the actual 0x... ID needed for list/delist/burn
            const objectId =
              result?.effects?.created?.[0]?.reference?.objectId  // standard location
              ?? result?.objectChanges?.find(
                  (c: any) => c.type === 'created' && c.objectType?.includes('NFT')
                )?.objectId                                        // fallback location
              ?? result?.digest;                                   // last resort fallback

            console.log('Minted NFT Object ID:', objectId);

            const newNft = {
              id: objectId,        // ✅ real on-chain ID — required for burn/list/delist
              name,
              description,
              imageUrl,
              imageHint: name,
              owner: account.address,
              isListed: false,
              rarity: 'common' as const,
            };
            addNft(newNft);

            toast({
              title: 'Mint Successful! 🎉',
              description: `${name} has been minted on Sui blockchain!`,
            });

            setIsMinting(false);
            setName('');
            setDescription('');
            setImageUrl('');

            setTimeout(() => {
              router.push('/my-nfts');
            }, 2000);
          },
          onError: (error: any) => {
            console.error('Blockchain mint failed:', error);
            toast({
              variant: 'destructive',
              title: 'Blockchain Mint Failed',
              description: error?.message || error?.toString() || 'Transaction failed',
            });
            setIsMinting(false);
          },
        }
      );
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast({
        variant: 'destructive',
        title: 'Transaction Error',
        description: error instanceof Error ? error.message : 'Failed to create transaction.',
      });
      setIsMinting(false);
    }
  };

  return (
    <div className="h-full w-full space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Mint NFT</h1>
        <p className="text-muted-foreground">
          Create and mint your NFT directly on the Sui blockchain
        </p>
      </div>

      {/* Stats/Info Bar */}
      {account && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground">Connected Wallet</p>
              <p className="truncate font-mono text-sm font-semibold">
                {account.address.slice(0, 8)}...{account.address.slice(-6)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
              <Sparkles className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Network</p>
              <p className="text-sm font-semibold capitalize">{CONTRACTS.NETWORK}</p>
            </div>
          </div>
        </div>
      )}

      {/* Mint Form Card */}
      <Card className="border shadow-md">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-bold">NFT Details</CardTitle>
          <CardDescription>
            Fill in the information below to create your unique NFT
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {!account && (
            <div className="rounded-lg border-2 border-yellow-500/50 bg-yellow-50 p-4 dark:bg-yellow-950/20">
              <div className="flex items-start gap-3">
                <Wallet className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-500" />
                <div>
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                    Wallet Not Connected
                  </h3>
                  <p className="mt-1 text-sm text-yellow-800 dark:text-yellow-200">
                    Please connect your wallet using the button in the header to mint NFTs.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold">NFT Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Legendary Sword"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isMinting || !account}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-semibold">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your NFT's special features and attributes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isMinting || !account}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="font-semibold">Image URL *</Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/your-nft-image.png"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={isMinting || !account}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Provide a direct URL to your NFT image (supports PNG, JPG, GIF)
              </p>
            </div>

            <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
              <p className="text-sm">
                <strong className="text-foreground">Blockchain Details:</strong>{' '}
                <span className="text-muted-foreground">
                  Your NFT will be minted on Sui{' '}
                {CONTRACTS.NETWORK}. Gas fees will be required.
                </span>
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t bg-muted/30 pt-6">
          <Button
            className="w-full font-semibold shadow-md"
            size="lg"
            onClick={handleMint}
            disabled={isMinting || !name.trim() || !description.trim() || !imageUrl.trim() || !account}
          >
            {isMinting ? (
              'Minting on Blockchain...'
            ) : !account ? (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet to Mint
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Mint NFT on Sui
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}