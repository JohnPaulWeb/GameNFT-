'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { ArrowLeft, Info, ShieldCheck, Tag, Wallet } from 'lucide-react';
import { Transaction } from '@mysten/sui/transactions';

import { CONTRACTS } from '@/app/components/contracts';
import { useMarketplace } from '@/app/components/providers';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { useToast } from '@/app/hooks/use-toast';

export default function ListPage() {
  const [nftObjectId, setNftObjectId] = useState('');
  const [price, setPrice] = useState('');
  const [isListing, setIsListing] = useState(false);

  const account = useCurrentAccount();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const client = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { listNft } = useMarketplace();

  const backPath = useMemo(() => {
    const from = searchParams.get('from');
    return from && from.startsWith('/') ? from : '/my-nfts';
  }, [searchParams]);

  useEffect(() => {
    const presetNftId = searchParams.get('nftId');
    if (presetNftId) {
      setNftObjectId(presetNftId);
    }
  }, [searchParams]);

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(backPath);
  };

  const parsedPrice = Number(price || 0);
  const canSubmit = !!account && !!nftObjectId.trim() && !!price && !isListing;

  const handleList = async () => {
    if (!nftObjectId.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please enter the NFT Object ID.',
      });
      return;
    }

    const priceNum = parseFloat(price);
    if (!price || Number.isNaN(priceNum) || priceNum <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Price',
        description: 'Please enter a valid price greater than 0.',
      });
      return;
    }

    if (!account) {
      toast({
        variant: 'destructive',
        title: 'Wallet not connected',
        description: 'Please connect your wallet to list an NFT.',
      });
      return;
    }

    setIsListing(true);

    try {
      const objectData = await client.getObject({
        id: nftObjectId,
        options: { showOwner: true, showType: true, showContent: true },
      });

      if (objectData.error || !objectData.data) {
        toast({
          variant: 'destructive',
          title: 'Object Not Found',
          description: 'This Object ID does not exist on-chain.',
        });
        setIsListing(false);
        return;
      }

      const owner = objectData.data.owner;
      const objectType = objectData.data.type;
      const isOwnedByWallet =
        owner &&
        typeof owner === 'object' &&
        'AddressOwner' in owner &&
        owner.AddressOwner === account.address;

      if (!isOwnedByWallet) {
        toast({
          variant: 'destructive',
          title: 'Not Your NFT',
          description: 'This NFT is not owned by your wallet. You can only list NFTs you own.',
        });
        setIsListing(false);
        return;
      }

      const expectedNftType = `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::NFT`;
      if (objectType !== expectedNftType) {
        toast({
          variant: 'destructive',
          title: 'Invalid NFT Type',
          description: 'This is not a valid NFT from this marketplace.',
        });
        setIsListing(false);
        return;
      }

      const priceInMist = Math.floor(priceNum * 1_000_000_000);
      const tx = new Transaction();

      tx.moveCall({
        target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::list`,
        arguments: [tx.object(CONTRACTS.MARKETPLACE_ID), tx.object(nftObjectId), tx.pure.u64(priceInMist)],
      });

      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: () => {
            const nftContent = objectData.data?.content;
            if (nftContent && 'fields' in nftContent) {
              const fields = nftContent.fields as any;
              listNft(
                {
                  id: nftObjectId,
                  name: fields.name || 'Unknown NFT',
                  description: fields.description || '',
                  imageUrl: fields.url || '',
                  imageHint: fields.name || 'nft image',
                  owner: account.address,
                  rarity: 'common',
                  isListed: true,
                },
                priceNum
              );
            }

            toast({
              title: 'NFT Listed! 🏷️',
              description: `Your NFT is now listed for ${priceNum} SUI.`,
            });

            setIsListing(false);
            setNftObjectId('');
            setPrice('');

            setTimeout(() => {
              router.push('/marketplace');
            }, 1200);
          },
          onError: (error: any) => {
            let errorMessage = 'Transaction failed';
            if (error?.message) {
              const msg = error.message.toLowerCase();
              if (msg.includes('invalidprice') || msg.includes('einvalidprice')) {
                errorMessage = 'Invalid price. Price must be greater than 0.';
              } else if (msg.includes('insufficient') && msg.includes('gas')) {
                errorMessage = 'Insufficient gas. Make sure you have enough SUI.';
              } else if (msg.includes('already exists') || msg.includes('duplicate')) {
                errorMessage = 'This NFT is already listed.';
              } else {
                errorMessage = error.message;
              }
            }

            toast({
              variant: 'destructive',
              title: 'Listing Failed',
              description: errorMessage,
            });
            setIsListing(false);
          },
        }
      );
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Transaction Error',
        description: error instanceof Error ? error.message : 'Failed to create transaction.',
      });
      setIsListing(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[hsl(var(--bg-void))] px-4 py-8 md:px-8 md:py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-24 -top-16 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl md:h-56 md:w-56" />
        <div className="absolute -left-20 top-1/2 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl md:h-48 md:w-48" />
        <div className="absolute right-1/4 top-16 h-24 w-24 rounded-full bg-emerald-400/10 blur-3xl md:h-32 md:w-32" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:42px_42px] opacity-12" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="ghost"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white/85 hover:bg-white/10 hover:text-white"
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
            <Tag className="h-3.5 w-3.5" />
            List On Marketplace
          </div>
        </div>

        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-white/[0.015] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl md:p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
          <div className="absolute -right-12 top-10 h-28 w-28 rounded-full bg-cyan-400/10 blur-2xl" />
          <div className="absolute -left-12 bottom-0 h-36 w-36 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure listing flow
              </div>

              <div className="space-y-4">
                <h1 className="max-w-2xl font-display text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl">
                  Create a listing with a premium finish.
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-white/65 md:text-base">
                  Add your NFT object ID, set a price, and confirm the transaction in your wallet. The layout keeps the action obvious, the status visible, and the decision points calm.
                </p>
              </div>

              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(34,211,238,0.12),rgba(99,102,241,0.08),rgba(16,185,129,0.08))] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-300/20 blur-2xl" />
                <div className="absolute -bottom-10 left-16 h-28 w-28 rounded-full bg-emerald-300/15 blur-3xl" />
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                  <Image
                    src="/nft-aurora-showcase.svg"
                    alt="NFT listing hero artwork"
                    width={1200}
                    height={800}
                    className="h-24 w-full object-cover opacity-90 sm:h-28 md:h-32 lg:h-36"
                    priority
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                </div>

                <div className="relative mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div className="space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100/70">
                      Listing Preview
                    </p>
                    <div className="space-y-2">
                      <div className="h-4 w-40 rounded-full bg-white/15" />
                      <div className="h-3 w-52 rounded-full bg-white/10" />
                      <div className="h-3 w-36 rounded-full bg-white/10" />
                    </div>
                  </div>

                  <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-[22px] border border-white/12 bg-black/20 backdrop-blur-xl">
                    <div className="absolute inset-2 rounded-[20px] border border-cyan-300/20 bg-gradient-to-br from-cyan-400/30 via-indigo-400/15 to-emerald-400/20" />
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-[0_0_30px_rgba(34,211,238,0.18)]">
                      <Tag className="h-8 w-8 text-cyan-200" />
                    </div>
                  </div>
                </div>

                <div className="relative mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">Asset</p>
                    <p className="mt-2 text-sm text-white/80">NFT Object ID</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">Market</p>
                    <p className="mt-2 text-sm text-white/80">Sui Marketplace</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">State</p>
                    <p className="mt-2 text-sm text-white/80">Ready to list</p>
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/70">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                Designed for quick, low-friction listing
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Step 1</p>
                  <p className="mt-2 text-sm font-medium text-white/85">Paste NFT object ID</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Step 2</p>
                  <p className="mt-2 text-sm font-medium text-white/85">Set your SUI price</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Step 3</p>
                  <p className="mt-2 text-sm font-medium text-white/85">Confirm in wallet</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 md:p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Fallback route</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">If browser history is unavailable, the back button returns to {backPath}.</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 md:p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Price preview</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">
                    {Number.isFinite(parsedPrice) ? parsedPrice.toFixed(2) : '0.00'} SUI before conversion to MIST.
                  </p>
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
                <div className="rounded-[24px] border border-yellow-400/20 bg-yellow-500/10 p-4 md:p-5">
                  <div className="flex items-start gap-3">
                    <Wallet className="mt-0.5 h-5 w-5 text-yellow-300" />
                    <div>
                      <h2 className="font-semibold text-yellow-50">Wallet not connected</h2>
                      <p className="mt-1 text-sm text-yellow-100/75">
                        Connect your wallet to continue. The listing flow depends on signing the transaction locally.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Card className="overflow-hidden border-white/10 bg-white/[0.04] shadow-[0_24px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl">
              <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-indigo-300 to-emerald-400" />
              <CardHeader className="space-y-3 border-b border-white/10 pb-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-2xl font-semibold text-white">List NFT for Sale</CardTitle>
                    <CardDescription className="mt-1 text-white/60">
                      Your NFT stays under your control until the transaction confirms on-chain.
                    </CardDescription>
                  </div>
                  <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
                    On-chain
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Ownership</p>
                    <p className="mt-2 text-sm text-white/75">Must belong to your wallet</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Pricing</p>
                    <p className="mt-2 text-sm text-white/75">Set any value above zero</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Approval</p>
                    <p className="mt-2 text-sm text-white/75">Sign in your wallet popup</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5 pt-6">
                {!account ? (
                  <div className="rounded-2xl border border-yellow-500/40 bg-yellow-50/90 p-4 dark:bg-yellow-950/20">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <Wallet className="mt-0.5 h-5 w-5 text-yellow-700 dark:text-yellow-500" />
                        <div>
                          <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">Connect wallet first</p>
                          <p className="text-xs text-yellow-800 dark:text-yellow-200">
                            You need an active wallet session to submit this listing.
                          </p>
                        </div>
                      </div>
                      <div className="[&_button]:h-10 [&_button]:rounded-lg [&_button]:px-4 [&_button]:font-semibold">
                        <ConnectButton />
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="nftObjectId" className="text-sm font-semibold text-white/90">
                    NFT Object ID
                  </Label>
                  <Input
                    id="nftObjectId"
                    placeholder="0x1234...abcd"
                    value={nftObjectId}
                    onChange={(e) => setNftObjectId(e.target.value)}
                    disabled={isListing}
                    className="h-12 border-white/15 bg-black/20 font-mono text-sm text-white placeholder:text-white/35 focus-visible:ring-cyan-400/40"
                  />
                  <p className="text-xs text-white/45">Paste the exact on-chain object ID of the NFT you own.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-semibold text-white/90">
                    Price (SUI)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="1.5"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    disabled={isListing}
                    className="h-12 border-white/15 bg-black/20 text-white placeholder:text-white/35 focus-visible:ring-cyan-400/40"
                  />
                  <p className="text-xs text-white/45">Conversion: 1 SUI = 1,000,000,000 MIST.</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/70">Preview</p>
                    <p className="mt-2 text-sm font-medium text-cyan-50">
                      {Number.isFinite(parsedPrice) ? parsedPrice.toFixed(2) : '0.00'} SUI
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Status</p>
                    <p className="mt-2 text-sm font-medium text-white/80">
                      {canSubmit ? 'Ready to submit' : 'Fill in both fields to continue'}
                    </p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-t border-white/10 bg-black/20 pt-5">
                <Button
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-emerald-400 font-semibold text-black shadow-[0_12px_30px_rgba(34,211,238,0.18)] transition-all hover:from-cyan-400 hover:to-emerald-300 hover:shadow-[0_16px_38px_rgba(34,211,238,0.25)]"
                  onClick={handleList}
                  disabled={!canSubmit}
                >
                  {isListing ? (
                    'Listing NFT...'
                  ) : !account ? (
                    <>
                      <Wallet className="mr-2 h-4 w-4" />
                      Connect Wallet to List
                    </>
                  ) : (
                    <>
                      <Tag className="mr-2 h-4 w-4" />
                      List NFT for {price || '0'} SUI
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-white/10 bg-white/[0.03] backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-white">
                      <Info className="h-4 w-4 text-cyan-300" />
                      Listing Checklist
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-white/70">
                    <p>1. NFT must be in your wallet and not already listed.</p>
                    <p>2. Enter a valid SUI price greater than zero.</p>
                    <p>3. Approve the transaction in your wallet popup.</p>
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-white/[0.03] backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-white">
                      <ShieldCheck className="h-4 w-4 text-emerald-300" />
                      Safety Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-white/70">
                    <p>Only list NFTs that belong to your connected wallet address.</p>
                    <p>You can delist later and return the NFT back to your wallet.</p>
                    <p>Always verify object ID and price before signing.</p>
                  </CardContent>
                </Card>
              </div>
          </div>
        </section>
      </div>
    </div>
  );
}
