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
    <div className="w-full min-h-screen flex flex-col relative">
      {/* Hero Section */}
      <div className="relative overflow-hidden px-4 md:px-8 py-12 md:py-20">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div 
            className="absolute top-0 left-1/3 w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(0, 240, 255, 0.5), rgba(99, 102, 241, 0.3), transparent)',
              animation: 'glow-pulse 8s ease-in-out infinite',
            }} 
          />
          <div 
            className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full opacity-15 blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4), transparent)',
              animation: 'aurora 12s ease-in-out infinite',
              animationDelay: '2s',
            }} 
          />
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-4 animate-slide-in-down">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-400/40 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="text-xs font-bold text-cyan-300 tracking-wider uppercase">Mint & List Your NFT</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-5xl md:text-7xl font-bold font-display leading-tight tracking-tight text-white">
                Create Your
                <span className="block bg-gradient-to-r from-cyan-300 via-indigo-400 to-cyan-400 bg-clip-text text-transparent animate-fade-up" style={{animationDelay: '0.1s'}}>
                  Game NFT
                </span>
              </h1>
            </div>
            <p className="text-lg md:text-xl text-[hsl(var(--text-secondary))] max-w-3xl leading-relaxed font-light animate-fade-up" style={{animationDelay: '0.2s'}}>
              Design and mint unique gaming items, then list them on the premium SuiPlay marketplace. Full on-chain ownership, permanent blockchain verification.
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left Column - Form */}
            <div className="space-y-8">
              <div className="grid gap-3 sm:grid-cols-3 mb-2">
                <div className="group relative overflow-hidden rounded-xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-indigo-500/5 backdrop-blur-md px-4 py-4 transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-500/15">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity -z-10" style={{background: 'radial-gradient(circle at center, rgba(0,240,255,0.1), transparent)'}}></div>
                  <p className="text-xs font-semibold text-cyan-300/70 mb-1 tracking-wider uppercase">Step 1</p>
                  <p className="text-sm font-bold text-white">Add Details</p>
                </div>
                <div className="group relative overflow-hidden rounded-xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/10 to-cyan-500/5 backdrop-blur-md px-4 py-4 transition-all duration-300 hover:border-indigo-400/40 hover:bg-indigo-500/15">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity -z-10" style={{background: 'radial-gradient(circle at center, rgba(99,102,241,0.1), transparent)'}}></div>
                  <p className="text-xs font-semibold text-indigo-300/70 mb-1 tracking-wider uppercase">Step 2</p>
                  <p className="text-sm font-bold text-white">Preview</p>
                </div>
                <div className="group relative overflow-hidden rounded-xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-indigo-500/5 backdrop-blur-md px-4 py-4 transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-500/15">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity -z-10" style={{background: 'radial-gradient(circle at center, rgba(0,240,255,0.1), transparent)'}}></div>
                  <p className="text-xs font-semibold text-cyan-300/70 mb-1 tracking-wider uppercase">Step 3</p>
                  <p className="text-sm font-bold text-white">Mint on Sui</p>
                </div>
              </div>

              {/* Info Cards */}
              {account && (
                <div className="grid gap-4 grid-cols-2">
                  <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl p-4 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-lg">
                    <div className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 rounded-2xl blur-xl"
                      style={{
                        background: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.1) 0%, transparent 70%)',
                        pointerEvents: 'none',
                      }}
                    />
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-[hsl(var(--text-secondary))] mb-1">Connected Wallet</p>
                        <p className="truncate font-mono text-xs font-semibold text-cyan-300">
                          {account.address.slice(0, 6)}...{account.address.slice(-4)}
                        </p>
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/20">
                        <Wallet className="h-4 w-4 text-cyan-300" />
                      </div>
                    </div>
                  </div>

                  <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl p-4 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-lg">
                    <div className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 rounded-2xl blur-xl"
                      style={{
                        background: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.1) 0%, transparent 70%)',
                        pointerEvents: 'none',
                      }}
                    />
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-[hsl(var(--text-secondary))] mb-1">Network</p>
                        <p className="text-xs font-semibold text-white capitalize">{CONTRACTS.NETWORK}</p>
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/20">
                        <Sparkles className="h-4 w-4 text-cyan-300" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Form Card */}
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl">
                <div className="absolute -inset-px opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10 rounded-3xl blur-xl"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.1) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }}
                />

                <div className="p-8 space-y-8">
                  {/* Header */}
                  <div className="space-y-2">
                    <h2 className="text-2xl md:text-3xl font-bold font-display text-white">NFT Details</h2>
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
                            Please connect your Sui wallet using the button in the header to mint NFTs on the Sui blockchain.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
            
                  <div className="space-y-6">
                    {/* Name Input */}
                    <div className="space-y-3 group">
                      <Label htmlFor="name" className="font-bold text-white text-sm tracking-tight">NFT Name <span className="text-cyan-400 text-xs">required</span></Label>
                      <div className="relative">
                        <Input
                          id="name"
                          placeholder="e.g., Legendary Frost Sword"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={isMinting || !account}
                          className="h-12 rounded-xl border border-white/15 bg-gradient-to-r from-white/8 to-white/3 backdrop-blur-md text-white placeholder:text-white/35 focus:border-cyan-400/60 focus:ring-0 focus:bg-gradient-to-r focus:from-white/10 focus:to-white/5 transition-all duration-300 font-medium"
                        />
                        <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" style={{background: 'radial-gradient(ellipse at center, rgba(0,240,255,0.1), transparent)', inset: '-1px'}}></div>
                      </div>
                      <p className="text-xs text-white/50 font-light">Keep it concise and memorable (under 30 characters)</p>
                    </div>

                    {/* Description Input */}
                    <div className="space-y-3 group">
                      <Label htmlFor="description" className="font-bold text-white text-sm tracking-tight">Description <span className="text-cyan-400 text-xs">required</span></Label>
                      <div className="relative">
                        <Textarea
                          id="description"
                          placeholder="Describe your NFT's special features, abilities, rarity tier, and unique attributes..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          disabled={isMinting || !account}
                          rows={4}
                          className="resize-none rounded-xl border border-white/15 bg-gradient-to-r from-white/8 to-white/3 backdrop-blur-md text-white placeholder:text-white/35 focus:border-cyan-400/60 focus:ring-0 focus:bg-gradient-to-r focus:from-white/10 focus:to-white/5 transition-all duration-300 font-medium"
                        />
                        <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" style={{background: 'radial-gradient(ellipse at center, rgba(0,240,255,0.1), transparent)', inset: '-1px'}}></div>
                      </div>
                      <p className="text-xs text-white/50 font-light">Highlight what makes this item special (150-200 characters is ideal)</p>
                    </div>

                    {/* Image URL Input */}
                    <div className="space-y-3 group">
                      <Label htmlFor="imageUrl" className="font-bold text-white text-sm tracking-tight">Image URL <span className="text-cyan-400 text-xs">required</span></Label>
                      <div className="relative">
                        <Input
                          id="imageUrl"
                          type="url"
                          placeholder="https://example.com/nft-image-1024x1024.png"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          disabled={isMinting || !account}
                          className="h-12 rounded-xl border border-white/15 bg-gradient-to-r from-white/8 to-white/3 backdrop-blur-md text-white placeholder:text-white/35 focus:border-cyan-400/60 focus:ring-0 focus:bg-gradient-to-r focus:from-white/10 focus:to-white/5 transition-all duration-300 font-medium"
                        />
                        <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" style={{background: 'radial-gradient(ellipse at center, rgba(0,240,255,0.1), transparent)', inset: '-1px'}}></div>
                      </div>
                      <p className="text-xs text-white/50 font-light">
                        Direct link to image file • Supports PNG, JPG, GIF, WebP • Recommend 1024x1024px square
                      </p>
                    </div>

                    {/* Blockchain Info */}
                    <div className="group relative overflow-hidden rounded-xl border border-cyan-400/30 bg-gradient-to-r from-cyan-500/15 to-indigo-500/10 backdrop-blur-sm p-5 transition-all duration-300 hover:border-cyan-400/50 hover:bg-cyan-500/20">
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity -z-10 rounded-xl" style={{background: 'radial-gradient(ellipse at center, rgba(0,240,255,0.15), transparent)', pointerEvents: 'none'}}></div>
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20 border border-cyan-400/40">
                            <Sparkles className="h-5 w-5 text-cyan-300" />
                          </div>
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="font-bold text-cyan-100 text-sm mb-1">On-Chain Verification</p>
                          <p className="text-sm text-cyan-200/75 leading-relaxed">
                            Your NFT will be permanently minted on Sui {CONTRACTS.NETWORK}. Small gas fees in SUI tokens will apply.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-white/10 bg-gradient-to-t from-cyan-500/10 via-white/5 to-transparent p-8">
                  <Button
                    className="w-full font-bold text-lg h-14 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white shadow-lg shadow-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    size="lg"
                    onClick={handleMint}
                    disabled={isMinting || !name.trim() || !description.trim() || !imageUrl.trim() || !account}
                  >
                    {isMinting ? (
                      <>
                        <div className="animate-spin mr-3" style={{animation: 'spin 1s linear infinite'}}>◆</div>
                        <span>Minting on Blockchain...</span>
                      </>
                    ) : !account ? (
                      <>
                        <Wallet className="mr-2 h-5 w-5" />
                        <span>Connect Wallet to Mint</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        <span>Mint NFT on Sui</span>
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-white/50 text-center mt-4 font-light">All fields are required. Make sure your wallet is connected before minting.</p>
                </div>
              </div>
            </div>

            {/* Right Column - Live Preview */}
            <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-display text-white">Live Preview</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))]">See how your NFT will appear in the marketplace</p>
              </div>

              <Card
                className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl transition-all duration-500 ease-out hover:border-cyan-400/60 hover:shadow-2xl hover:shadow-cyan-400/20 animate-fade-up"
              >
                {/* Enhanced ambient glow effect */}
                <div className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 rounded-2xl blur-2xl"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.3) 0%, rgba(99, 102, 241, 0.2) 50%, transparent 70%)',
                    pointerEvents: 'none',
                  }}
                />
                
                {/* ito yung Image container */}
                <div className="relative aspect-square w-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02]">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={name || 'Preview'}
                      className="object-cover w-full h-full transition-all duration-700 ease-out group-hover:scale-[1.15] group-hover:brightness-110 group-hover:saturate-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23111827" width="400" height="400"/%3E%3Ctext fill="%236b7280" font-family="sans-serif" font-size="16" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EInvalid Image URL%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (

                    // div
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="text-center space-y-2">
                        <Sparkles className="h-12 w-12 text-[hsl(var(--text-muted))] mx-auto" />
                        <p className="text-sm text-[hsl(var(--text-secondary))]">Enter image URL to preview</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Enhanced gradient overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>  
                
                <CardHeader className="space-y-2 pb-2">
                  <CardTitle className="line-clamp-2 text-lg md:text-xl font-bold font-display tracking-tight leading-snug">
                    {name || 'Your NFT Name'}
                  </CardTitle>
                  <p className="line-clamp-2 text-xs md:text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                    {description || 'Your NFT description will appear here...'}
                  </p>
                </CardHeader>
                
                <CardContent className="flex-grow pb-3">
                  <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-xs font-semibold text-[hsl(var(--text-secondary))]">
                      Ready to Mint 
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="group relative overflow-hidden rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/15 to-cyan-500/10 backdrop-blur-xl p-6 space-y-4 transition-all duration-300 hover:border-indigo-400/40">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity -z-10 rounded-2xl" style={{background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.1), transparent)', pointerEvents: 'none'}}></div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/30 border border-indigo-400/50 flex items-center justify-center">
                      <span className="text-lg">💡</span>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-indigo-100 tracking-tight">Pro Tips for Success</h4>
                </div>
                <div className="space-y-3 text-sm text-indigo-100/80 font-light">
                  <div className="flex gap-3"><div className="text-cyan-400 flex-shrink-0 font-bold">✓</div><p>Use 1024x1024px square images for optimal display</p></div>
                  <div className="flex gap-3"><div className="text-cyan-400 flex-shrink-0 font-bold">✓</div><p>Keep NFT names concise and memorable (under 30 chars)</p></div>
                  <div className="flex gap-3"><div className="text-cyan-400 flex-shrink-0 font-bold">✓</div><p>Write engaging descriptions (150-200 characters)</p></div>
                  <div className="flex gap-3"><div className="text-cyan-400 flex-shrink-0 font-bold">✓</div><p>Ensure image URLs are direct (not shortened links)</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}