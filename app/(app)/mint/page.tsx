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
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-2xl border-2 shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold">Mint a New NFT</CardTitle>
          <CardDescription>
            Create and mint your NFT directly on Sui blockchain using the Move smart contract.
          </CardDescription>
          {account && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
              <Wallet className="h-5 w-5 text-primary" />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-muted-foreground">Connected Wallet</span>
                <span suppressHydrationWarning className="font-mono text-sm font-semibold">
                  {account.address.slice(0, 6)}...{account.address.slice(-4)}
                </span>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {!account && (
            <div className="rounded-lg border-2 border-yellow-500/50 bg-yellow-50 p-4 dark:bg-yellow-950/20">
              <div className="flex items-start gap-3">
                <Wallet className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                <div>
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                    Wallet Not Connected
                  </h3>
                  <p className="mt-1 text-sm text-yellow-800 dark:text-yellow-200">
                    Please connect your wallet using the button in the top right corner to mint NFTs.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">NFT Name</Label>
              <Input
                id="name"
                placeholder="e.g., Legendary Sword"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isMinting}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your NFT..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isMinting}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="text-sm font-semibold">Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/image.png"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={isMinting}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Enter a direct URL to your NFT image
              </p>
            </div>

            <div className="rounded-lg border-2 border-blue-500/50 bg-blue-50 p-4 dark:bg-blue-950/20">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Smart Contract:</strong> Minting will call the Move contract on Sui{' '}
                {CONTRACTS.NETWORK}. Make sure your wallet has sufficient SUI for gas fees.
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t bg-muted/50 pt-6">
          <Button
            className="w-full font-semibold shadow-sm"
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