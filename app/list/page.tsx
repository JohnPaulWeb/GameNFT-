'use client';

import { useEffect, useMemo, useState } from 'react';
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
    <div className="w-full min-h-screen bg-[hsl(var(--bg-void))]">
      <section className="relative overflow-hidden border-b border-white/10 px-4 pb-10 pt-10 md:px-8 md:pb-14 md:pt-14">
        <div className="absolute -right-24 -top-16 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="ghost"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white/85 hover:bg-white/10"
              onClick={handleGoBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <div className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
              List On Marketplace
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-4xl font-black tracking-tight text-white md:text-5xl">Create A Listing</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-white/65 md:text-base">
              Enter your NFT object ID and target price, then confirm the transaction in your wallet to publish your
              listing.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-white/70">Fallback return path: {backPath}</span>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 md:px-8 md:py-10">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-white/10 bg-white/[0.03] shadow-2xl shadow-black/20 backdrop-blur-xl">
            <CardHeader className="space-y-2 border-b border-white/10 pb-6">
              <CardTitle className="text-2xl font-semibold text-white">List NFT for Sale</CardTitle>
              <CardDescription className="text-white/60">
                Your NFT stays under your control until the transaction confirms on-chain.
              </CardDescription>

              {account ? (
                <div className="mt-2 inline-flex items-center gap-3 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2">
                  <Wallet className="h-4 w-4 text-emerald-300" />
                  <span suppressHydrationWarning className="font-mono text-xs font-semibold text-emerald-100">
                    {account.address.slice(0, 8)}...{account.address.slice(-6)}
                  </span>
                </div>
              ) : null}
            </CardHeader>

            <CardContent className="space-y-5 pt-6">
              {!account ? (
                <div className="rounded-xl border border-yellow-500/40 bg-yellow-50/90 p-4 dark:bg-yellow-950/20">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Wallet className="mt-0.5 h-5 w-5 text-yellow-700 dark:text-yellow-500" />
                      <div>
                        <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">Connect wallet first</p>
                        <p className="text-xs text-yellow-800 dark:text-yellow-200">You need an active wallet session to submit this listing.</p>
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
                  className="h-11 border-white/15 bg-black/20 font-mono text-sm text-white placeholder:text-white/35"
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
                  className="h-11 border-white/15 bg-black/20 text-white placeholder:text-white/35"
                />
                <p className="text-xs text-white/45">Conversion: 1 SUI = 1,000,000,000 MIST.</p>
              </div>

              <div className="rounded-xl border border-cyan-400/25 bg-cyan-400/8 px-3 py-2">
                <p className="text-xs text-cyan-100">
                  Price preview: <span className="font-semibold">{Number.isFinite(parsedPrice) ? parsedPrice.toFixed(2) : '0.00'} SUI</span>
                </p>
              </div>
            </CardContent>

            <CardFooter className="border-t border-white/10 bg-black/20 pt-5">
              <Button
                className="h-11 w-full rounded-xl bg-cyan-500 font-semibold text-black hover:bg-cyan-400"
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

          <div className="space-y-6">
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
  );
}
