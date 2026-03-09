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
  
  // ito naman yung  Mint 
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


  // ito naman yung handleMint function para sa Mint
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

    // ito yung minting
    setIsMinting(true);
    try {
      console.log('PACKAGE_ID:', CONTRACTS.PACKAGE_ID);
      console.log('MODULE_NAME:', CONTRACTS.MODULE_NAME);
      console.log('NETWORK:', CONTRACTS.NETWORK);
      console.log('Minting NFT:', name);

      const tx = new Transaction();
      const toBytes = (str: string) => new TextEncoder().encode(str);
      // ito yung move call 
      tx.moveCall({
        target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::mint`,
        arguments: [
          tx.pure(bcs.vector(bcs.u8()).serialize(toBytes(name))),
          tx.pure(bcs.vector(bcs.u8()).serialize(toBytes(description))),
          tx.pure(bcs.vector(bcs.u8()).serialize(toBytes(imageUrl))),
        ],
      });

      // ito naman yung  Sign and Execute Transaction 
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

            // ito yung When Minting Success
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

          // ito naman yung Alert if you encounter Failed Mint
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
      // ito yung pag nag alert is say when error 
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
// dito magsisimula yung code mo 
  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* ito yung page header */}
      <div className="px-4 md:px-8 pt-8 pb-6">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/25 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span className="text-xs font-semibold text-cyan-300 tracking-wide uppercase">Mint NFT</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-white tracking-tight">Create Your NFT</h1>
          <p className="mt-2 text-sm text-white/50 max-w-xl">
            Design and mint unique gaming items on the Sui blockchain. Full on-chain ownership, permanent verification.
          </p>
        </div>
      </div>

      {/* ito naman yung Content Section */}
      <div className="flex-1 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* ito naman yung Left Column */}
            <div className="space-y-6">
              <div className="grid gap-2 sm:grid-cols-3">
                {[{step: 'Step 1', label: 'Add Details'}, {step: 'Step 2', label: 'Preview'}, {step: 'Step 3', label: 'Mint on Sui'}].map(({step, label}) => (
                  <div key={step} className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-3">
                    <p className="text-[10px] font-semibold text-white/40 mb-0.5 tracking-wider uppercase">{step}</p>
                    <p className="text-sm font-semibold text-white/80">{label}</p>
                  </div>
                ))}
              </div>

              {/* ito yung Info Cards */}
              {account && (
                <div className="grid gap-3 grid-cols-2">
                  <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
                    <div>
                      <p className="text-[10px] font-medium text-white/40 mb-0.5">Connected Wallet</p>
                      <p className="truncate font-mono text-xs font-semibold text-cyan-300">{account.address.slice(0, 6)}...{account.address.slice(-4)}</p>
                    </div>
                    <Wallet className="h-4 w-4 text-white/30 shrink-0" />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
                    <div>
                      <p className="text-[10px] font-medium text-white/40 mb-0.5">Network</p>
                      <p className="text-xs font-semibold text-white/80 capitalize">{CONTRACTS.NETWORK}</p>
                    </div>
                    <Sparkles className="h-4 w-4 text-white/30 shrink-0" />
                  </div>
                </div>
              )}

              {/* ito yung Main Form */}
              <div className="rounded-2xl border border-white/[0.09] bg-white/[0.03]">
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold font-display text-white">NFT Details</h2>
                    <p className="text-sm text-white/40 mt-0.5">Fill in the information below to create your unique NFT</p>
                  </div>
                  
                  {!account && (
                    <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/[0.06] p-4">
                      <div className="flex items-center gap-3">
                        <Wallet className="h-4 w-4 flex-shrink-0 text-cyan-400" />
                        <p className="text-sm text-cyan-200/80">Connect your Sui wallet to mint NFTs on the blockchain.</p>
                      </div>
                    </div>
                  )}
            
                  <div className="space-y-5">
                    {/* ito yung name Input */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-white/80">NFT Name <span className="text-cyan-400/70 text-xs">required</span></Label>
                      <Input
                        id="name"
                        placeholder="e.g., Legendary Frost Sword"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isMinting || !account}
                        className="h-10 rounded-lg border border-white/[0.1] bg-white/[0.05] text-white placeholder:text-white/30 focus:border-cyan-400/50 focus:ring-0 transition-colors"
                      />
                    </div>

                    {/* Description Input */}

                    
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium text-white/80">Description <span className="text-cyan-400/70 text-xs">required</span></Label>
                      <Textarea 
                        id="description"
                        placeholder="Describe your NFT's special features, abilities, and unique attributes..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isMinting || !account}
                        rows={3}
                        className="resize-none rounded-lg border border-white/[0.1] bg-white/[0.05] text-white placeholder:text-white/30 focus:border-cyan-400/50 focus:ring-0 transition-colors"
                      />
                    </div>

                    {/*ito yung Image URL Input */}
                    <div className="space-y-2">
                      <Label htmlFor="imageUrl" className="text-sm font-medium text-white/80">Image URL <span className="text-cyan-400/70 text-xs">required</span></Label>
                      <Input
                        id="imageUrl"
                        type="url"
                        placeholder="https://example.com/nft-image-1024x1024.png"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        disabled={isMinting || !account}
                        className="h-10 rounded-lg border border-white/[0.1] bg-white/[0.05] text-white placeholder:text-white/30 focus:border-cyan-400/50 focus:ring-0 transition-colors"
                      />
                      <p className="text-xs text-white/35">Direct link • PNG, JPG, GIF, WebP • Recommend 1024×1024px</p>
                    </div>

                    {/*ito yung Blockchain Info */}
                    <div className="flex gap-3 rounded-lg border border-cyan-400/20 bg-cyan-400/[0.05] p-4">
                      <Sparkles className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-cyan-200/70 leading-relaxed">
                        Your NFT will be permanently minted on Sui {CONTRACTS.NETWORK}. Small gas fees in SUI tokens will apply.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ito naman yung Footer */}
                <div className="border-t border-white/[0.07] p-6">
                  <Button
                    className="w-full font-semibold h-11 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleMint}
                    disabled={isMinting || !name.trim() || !description.trim() || !imageUrl.trim() || !account}
                  >
                    {isMinting ? (
                      <><div className="animate-spin mr-2 text-sm">◆</div><span>Minting on Blockchain...</span></>
                    ) : !account ? (
                      <><Wallet className="mr-2 h-4 w-4" /><span>Connect Wallet to Mint</span></>
                    ) : (
                      <><Sparkles className="mr-2 h-4 w-4" /><span>Mint NFT on Sui</span></>
                    )}
                  </Button>
                  <p className="text-xs text-white/30 text-center mt-3">All fields required. Wallet must be connected.</p>
                </div>
              </div>
            </div>

            {/* ito yung Right Column - Live Preview */}
            <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <div>
                <h3 className="text-base font-bold font-display text-white">Live Preview</h3>
                <p className="text-xs text-white/40 mt-0.5">See how your NFT will appear in the marketplace</p>
              </div>

              <Card className="flex flex-col overflow-hidden rounded-xl border border-white/[0.09] bg-white/[0.03]">
                {/* ito yung Image Review */}
                <div className="relative aspect-square w-full flex-shrink-0 overflow-hidden bg-white/[0.02]">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={name || 'Preview'}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23111827" width="400" height="400"/%3E%3Ctext fill="%236b7280" font-family="sans-serif" font-size="16" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EInvalid Image URL%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    // ito yung icon sparkles
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="text-center space-y-1.5">
                        <Sparkles className="h-8 w-8 text-white/20 mx-auto" />
                        <p className="text-xs text-white/30">Enter image URL to preview</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ito yung Card Header */}
                <CardHeader className="space-y-1 pb-2">
                  <CardTitle className="line-clamp-2 text-base font-bold font-display tracking-tight">
                    {name || 'Your NFT Name'}
                  </CardTitle>
                  <p className="line-clamp-2 text-xs text-white/40">
                    {description || 'Your NFT description will appear here...'}
                  </p>
                </CardHeader>

                {/* ito yung Card Content */}
                <CardContent className="flex-grow pb-3">
                  <div className="px-2.5 py-1.5 rounded-md bg-white/[0.04] border border-white/[0.07]">
                    <span className="text-xs text-white/40">Ready to mint</span>
                  </div>
                </CardContent>
              </Card>

              {/* ito yung class with UI */}
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">💡</span>
                  <h4 className="text-sm font-semibold text-white/80">Pro Tips</h4>
                </div>
                <div className="space-y-2 text-xs text-white/50">
                  <div className="flex gap-2"><span className="text-cyan-400 shrink-0">✓</span><p>Use 1024×1024px square images for optimal display</p></div>
                  <div className="flex gap-2"><span className="text-cyan-400 shrink-0">✓</span><p>Keep NFT names concise and memorable (under 30 chars)</p></div>
                  <div className="flex gap-2"><span className="text-cyan-400 shrink-0">✓</span><p>Write engaging descriptions (150–200 characters)</p></div>
                  <div className="flex gap-2"><span className="text-cyan-400 shrink-0">✓</span><p>Ensure image URLs are direct links (not shortened)</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

