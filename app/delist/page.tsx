'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { ArrowLeft, PackageX, ShieldAlert, Wallet, X } from 'lucide-react';
import { Transaction } from '@mysten/sui/transactions';

import { CONTRACTS } from '@/app/components/contracts';
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
import { useToast } from '@/app/hooks/use-toast';

export default function DelistPage() {
  const [nftId, setNftId] = useState('');
  const [isDelisting, setIsDelisting] = useState(false);

  const account = useCurrentAccount();
  const { toast } = useToast();
  const router = useRouter();
  const client = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { delistNft } = useMarketplace();

  const handleExit = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }

    router.push('/my-nfts');
  };

  const handleDelist = async () => {
    if (!nftId.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please enter the NFT ID to delist.',
      });
      return;
    }

    if (!account) {
      toast({
        variant: 'destructive',
        title: 'Wallet not connected',
        description: 'Please connect your wallet to delist an NFT.',
      });
      return;
    }

    setIsDelisting(true);

    try {
      const marketplaceData = await client.getObject({
        id: CONTRACTS.MARKETPLACE_ID,
        options: { showContent: true },
      });

      if (!marketplaceData.data) {
        throw new Error('Marketplace object not found.');
      }

      const tx = new Transaction();

      tx.moveCall({
        target: `${CONTRACTS.PACKAGE_ID}::nft_marketplace::delist_and_take`,
        arguments: [
          tx.object(CONTRACTS.MARKETPLACE_ID),
          tx.pure.id(nftId),
        ],
      });

      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result: any) => {
            delistNft(nftId);

            toast({
              title: 'NFT Delisted! ✅',
              description: 'Your NFT has been removed from the marketplace and returned to your wallet.',
            });

            setIsDelisting(false);
            setNftId('');

            setTimeout(() => {
              router.push('/my-nfts');
            }, 2000);
          },

          onError: (error: any) => {
            let errorMessage = 'Transaction failed';

            if (error?.message) {
              const msg = error.message.toLowerCase();

              if (msg.includes('enotseller') || msg.includes('not seller')) {
                errorMessage = 'You are not the seller of this NFT. Only the seller can delist.';
              } else if (msg.includes('elistingnotfound') || msg.includes('not found')) {
                errorMessage = 'This NFT is not currently listed on the marketplace.';
              } else if (msg.includes('insufficient') && msg.includes('gas')) {
                errorMessage = 'Insufficient gas. Make sure you have enough SUI.';
              } else {
                errorMessage = error.message;
              }
            }

            toast({
              variant: 'destructive',
              title: 'Delist Failed',
              description: errorMessage,
            });
            setIsDelisting(false);
          },
        }
      );
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Transaction Error',
        description: error instanceof Error ? error.message : 'Failed to create transaction.',
      });
      setIsDelisting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[hsl(var(--bg-void))] px-4 py-8 md:px-8 md:py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-28 -top-16 h-44 w-44 rounded-full bg-orange-400/10 blur-3xl md:h-52 md:w-52" />
        <div className="absolute left-0 top-1/3 h-36 w-36 rounded-full bg-cyan-400/10 blur-3xl md:h-44 md:w-44" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:42px_42px] opacity-12" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleExit}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white/85 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Exit
          </Button>

          <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-200">
            <X className="h-3.5 w-3.5" />
            Delist NFT
          </div>
        </div>

        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-white/[0.015] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl md:p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-300/70 to-transparent" />
          <div className="absolute -right-12 top-8 h-28 w-28 rounded-full bg-orange-400/10 blur-2xl" />
          <div className="absolute -left-12 bottom-0 h-36 w-36 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-200">
                <ShieldAlert className="h-3.5 w-3.5" />
                On-chain action
              </div>

              <div className="space-y-4">
                <h1 className="max-w-2xl font-display text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl">
                  Delist with confidence.
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-white/65 md:text-base">
                  Remove a listed NFT, return it to your wallet, and keep the workflow simple. The page is built to feel fast, clear, and safe before you confirm anything on-chain.
                </p>
              </div>

              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(249,115,22,0.12),rgba(34,211,238,0.08),rgba(16,185,129,0.08))] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
                <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-orange-300/20 blur-2xl" />
                <div className="absolute -bottom-10 right-16 h-28 w-28 rounded-full bg-cyan-300/15 blur-3xl" />
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                  <Image
                    src="/nft-aurora-showcase.svg"
                    alt="NFT return hero artwork"
                    width={1200}
                    height={800}
                    className="h-24 w-full object-cover opacity-90 sm:h-28 md:h-32 lg:h-36"
                    priority
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                </div>

                <div className="relative mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div className="space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-100/70">
                      Return Preview
                    </p>
                    <div className="space-y-2">
                      <div className="h-4 w-44 rounded-full bg-white/15" />
                      <div className="h-3 w-56 rounded-full bg-white/10" />
                      <div className="h-3 w-32 rounded-full bg-white/10" />
                    </div>
                  </div>

                  <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-[22px] border border-white/12 bg-black/20 backdrop-blur-xl">
                    <div className="absolute inset-2 rounded-[20px] border border-orange-300/20 bg-gradient-to-br from-orange-400/25 via-cyan-400/10 to-emerald-400/15" />
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-[0_0_30px_rgba(249,115,22,0.18)]">
                      <Wallet className="h-8 w-8 text-orange-100" />
                    </div>
                  </div>
                </div>

                <div className="relative mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">Action</p>
                    <p className="mt-2 text-sm text-white/80">Remove listing</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">Destination</p>
                    <p className="mt-2 text-sm text-white/80">Your wallet</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">State</p>
                    <p className="mt-2 text-sm text-white/80">Ready to return</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Step 1</p>
                  <p className="mt-2 text-sm font-medium text-white/85">Paste the NFT UID</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Step 2</p>
                  <p className="mt-2 text-sm font-medium text-white/85">Confirm in wallet</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Step 3</p>
                  <p className="mt-2 text-sm font-medium text-white/85">NFT returns to you</p>
                </div>
              </div>

              {account ? (
                <div className="rounded-[24px] border border-emerald-400/20 bg-emerald-500/10 p-4 md:p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400/15">
                      <Wallet className="h-5 w-5 text-emerald-300" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-300/70">
                        Connected Wallet
                      </p>
                      <p suppressHydrationWarning className="mt-1 font-mono text-sm font-semibold text-emerald-100 md:text-base">
                        {account.address.slice(0, 8)}...{account.address.slice(-6)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-[24px] border border-amber-400/20 bg-amber-500/10 p-4 md:p-5">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="mt-0.5 h-5 w-5 text-amber-300" />
                    <div>
                      <h2 className="font-semibold text-amber-50">Wallet not connected</h2>
                      <p className="mt-1 text-sm text-amber-100/75">
                        Connect your wallet first, before you try to delist an NFT.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Card className="overflow-hidden border-white/10 bg-white/[0.04] shadow-[0_24px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl">
              <div className="h-1 w-full bg-gradient-to-r from-orange-400 via-cyan-300 to-emerald-400" />
              <CardHeader className="space-y-3 border-b border-white/10 pb-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-2xl font-semibold text-white">Delist NFT</CardTitle>
                    <CardDescription className="mt-1 text-white/60">
                      Paste the original NFT UID, not the listing object ID.
                    </CardDescription>
                  </div>
                  <div className="rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-200">
                    Gas only
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">Quick Tips</p>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-white/70">
                    <li>• Use the original NFT ID shown when listing</li>
                    <li>• Delisting only costs gas</li>
                    <li>• The NFT will be sent back to your wallet</li>
                  </ul>
                </div>
              </CardHeader>

              <CardContent className="space-y-5 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="nftId" className="text-sm font-semibold text-white/85">
                    NFT ID
                  </Label>
                  <Input
                    id="nftId"
                    placeholder="0x1234...abcd"
                    value={nftId}
                    onChange={(e) => setNftId(e.target.value)}
                    disabled={isDelisting}
                    className="h-12 border-white/10 bg-white/[0.05] font-mono text-sm text-white placeholder:text-white/30 focus-visible:ring-cyan-400/40"
                  />
                  <p className="text-xs text-white/45">
                    Enter the UID that was used when you created the listing.
                  </p>
                </div>

                {/* ito yung div classname */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Check</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/75">
                      Make sure the NFT ID matches the one from your listing record.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-orange-400/15 bg-orange-500/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-200/70">Return</p>
                    <p className="mt-2 text-sm leading-relaxed text-orange-50/80">
                      After confirmation, the NFT is removed from the marketplace and sent back to your wallet.
                    </p>
                  </div>  
                </div>
              </CardContent>

              <CardFooter className="border-t border-white/10 bg-white/[0.02] pt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-orange-400/50 bg-gradient-to-r from-orange-500/10 to-transparent text-orange-100 hover:bg-orange-500/15 hover:text-white"
                  size="lg"
                  onClick={handleDelist}
                  disabled={isDelisting || !nftId.trim() || !account}
                >
                  {isDelisting ? (
                    'Delisting NFT...'
                  ) : !account ? (
                    <>
                      <Wallet className="h-4 w-4" />
                      Connect Wallet to Delist
                    </>
                  ) : (
                    <>
                      <PackageX className="h-4 w-4" />
                      Delist NFT
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}