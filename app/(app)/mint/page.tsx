'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
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
  const client = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showEffects: true,        // ✅ Required to get created object IDs
          showObjectChanges: true,  // ✅ Backup way to get the object ID
        },
      }),
  });
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
            console.log('effects.created:', result?.effects?.created);
            console.log('objectChanges:', result?.objectChanges);

            // ✅ Method 1: from effects.created (needs showEffects: true)
            const fromEffects = result?.effects?.created?.find(
              (c: any) =>
                typeof c.owner === 'object' &&
                'AddressOwner' in c.owner &&
                c.owner.AddressOwner === account.address
            )?.reference?.objectId;

            // ✅ Method 2: from objectChanges (needs showObjectChanges: true)
            const fromChanges = result?.objectChanges?.find(
              (c: any) =>
                c.type === 'created' &&
                typeof c.owner === 'object' &&
                'AddressOwner' in c.owner &&
                c.owner.AddressOwner === account.address
            )?.objectId;

            const objectId = fromEffects ?? fromChanges;

            // ❌ Never fall back to digest — it is NOT an Object ID
            if (!objectId) {
              console.error('Could not find NFT Object ID. Full result:', JSON.stringify(result, null, 2));
              toast({
                variant: 'destructive',
                title: 'Mint Error',
                description: 'NFT was minted but could not get its Object ID. Check the console.',
              });
              setIsMinting(false);
              return;
            }

            console.log('✅ Real NFT Object ID:', objectId);

            const newNft = {
              id: objectId,        // ✅ real on-chain 0x... ID — required for burn/list/delist
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

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/30">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-semibold text-cyan-300">Create & List</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-display leading-tight tracking-tight text-white">
              Mint Your
              <span className="block bg-gradient-to-r from-cyan-300 via-cyan-400 to-cyan-300 bg-clip-text text-transparent">
                Exclusive NFT
              </span>
            </h1>
            <p className="text-lg text-[hsl(var(--text-secondary))] max-w-2xl leading-relaxed">
              Create unique gaming items and list them on our premium marketplace. Owned by you, verified on-chain.
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 px-4 md:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Info Cards */}
          {account && (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl p-6 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-lg">
                <div className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 rounded-2xl blur-xl"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.1) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }}
                />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-[hsl(var(--text-secondary))] mb-1">Connected Wallet</p>
                    <p className="truncate font-mono text-sm font-semibold text-cyan-300">
                      {account.address.slice(0, 8)}...{account.address.slice(-6)}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/20">
                    <Wallet className="h-5 w-5 text-cyan-300" />
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl p-6 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-lg">
                <div className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 rounded-2xl blur-xl"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.1) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }}
                />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-[hsl(var(--text-secondary))] mb-1">Network</p>
                    <p className="text-sm font-semibold text-white capitalize">{CONTRACTS.NETWORK}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/20">
                    <Sparkles className="h-5 w-5 text-cyan-300" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Form Card */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl overflow-hidden">
            <div className="absolute -inset-px opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10 rounded-3xl blur-xl"
              style={{
                background: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.1) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            <div className="p-8 md:p-12 space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-3xl md:text-4xl font-bold font-display text-white">NFT Details</h2>
                <p className="text-[hsl(var(--text-secondary))]">Fill in the information below to create your unique NFT</p>
              </div>

              {!account && (
                <div className="rounded-xl border-2 border-cyan-400/50 bg-gradient-to-r from-cyan-500/10 to-transparent p-6">
                  <div className="flex items-start gap-4">
                    <Wallet className="h-6 w-6 flex-shrink-0 text-cyan-400 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-cyan-100 text-lg">
                        Wallet Not Connected
                      </h3>
                      <p className="mt-2 text-sm text-cyan-200/80">
                        Please connect your wallet using the button in the header to mint NFTs on the Sui blockchain.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-semibold text-white">NFT Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Legendary Sword"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isMinting || !account}
                    className="h-12 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/40 focus:border-cyan-400/50 focus:ring-0"
                  />
                </div>

                {/* Description Input */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="font-semibold text-white">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your NFT's special features and attributes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isMinting || !account}
                    rows={4}
                    className="resize-none rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/40 focus:border-cyan-400/50 focus:ring-0"
                  />
                </div>

                {/* Image URL Input */}
                <div className="space-y-2">
                  <Label htmlFor="imageUrl" className="font-semibold text-white">Image URL *</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    placeholder="https://example.com/your-nft-image.png"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={isMinting || !account}
                    className="h-12 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/40 focus:border-cyan-400/50 focus:ring-0"
                  />
                  <p className="text-xs text-[hsl(var(--text-secondary))]">
                    Provide a direct URL to your NFT image (supports PNG, JPG, GIF, WebP)
                  </p>
                </div>

                {/* Blockchain Info */}
                <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">
                  <p className="text-sm text-white">
                    <strong className="text-cyan-300">On-Chain Verification:</strong>{' '}
                    <span className="text-[hsl(var(--text-secondary))]">
                      Your NFT will be minted on Sui {CONTRACTS.NETWORK}. Gas fees will apply.
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 bg-gradient-to-t from-white/5 to-transparent p-8 md:p-12">
              <Button
                className="w-full font-semibold text-lg h-12"
                size="lg"
                onClick={handleMint}
                disabled={isMinting || !name.trim() || !description.trim() || !imageUrl.trim() || !account}
              >
                {isMinting ? (
                  <>
                    <div className="animate-spin mr-2">◆</div>
                    Minting on Blockchain...
                  </>
                ) : !account ? (
                  <>
                    <Wallet className="mr-2 h-5 w-5" />
                    Connect Wallet to Mint
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Mint NFT on Sui
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}