'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Flame, Wallet } from 'lucide-react';
import { Transaction } from '@mysten/sui/transactions';

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
import { CONTRACTS } from '@/app/components/contracts';

export default function BurnPage() {
  const [nftObjectId, setNftObjectId] = useState('');
  const [isBurning, setIsBurning] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const account = useCurrentAccount();
  const { toast } = useToast();
  const router = useRouter();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { burnNft } = useMarketplace();

  const handleBurn = () => {
    if (!nftObjectId.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please enter the NFT Object ID to burn.',
      });
      return;
    }

    if (!confirmed) {
      toast({
        variant: 'destructive',
        title: 'Confirmation Required',
        description: 'Please check the confirmation box before burning.',
      });
      return;
    }

    if (!account) {
      toast({
        variant: 'destructive',
        title: 'Wallet not connected',
        description: 'Please connect your wallet to burn an NFT.',
      });
      return;
    }

    // ✅ FIX: setIsBurning BEFORE try block to prevent double-click race condition
    setIsBurning(true);

    try {
      console.log('PACKAGE_ID:', CONTRACTS.PACKAGE_ID);
      console.log('MODULE_NAME:', CONTRACTS.MODULE_NAME);
      console.log('NETWORK:', CONTRACTS.NETWORK);
      console.log('Burning NFT:', nftObjectId);

      const tx = new Transaction();

      // ✅ entry fun burn(nft: NFT)
      // NFT object is passed directly — it gets permanently deleted on-chain
      // No typeArguments: burn takes a concrete NFT type, NOT a generic <T>
      // Passing typeArguments to a non-generic function causes "Expected Object but received Object" error
      tx.moveCall({
        target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::burn`,
        arguments: [
          tx.object(nftObjectId), // NFT object (consumed and deleted)
        ],
      });

      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result: any) => {
            console.log('Burn successful!', result);

            // Update local state
            burnNft(nftObjectId);

            toast({
              title: 'NFT Burned 🔥',
              description: 'Your NFT has been permanently destroyed on the blockchain.',
            });

            setIsBurning(false);
            setNftObjectId('');
            setConfirmed(false);

            setTimeout(() => {
              router.push('/my-nfts');
            }, 2000);
          },
          onError: (error: any) => {
            console.error('Burn failed:', error);
            toast({
              variant: 'destructive',
              title: 'Burn Failed',
              // ✅ FIX: added error?.toString() fallback to match mint pattern
              description: error?.message || error?.toString() || 'Transaction failed',
            });
            setIsBurning(false);
          },
        }
      );
    } catch (error) {
      console.error('Error creating burn transaction:', error);
      toast({
        variant: 'destructive',
        title: 'Transaction Error',
        description: error instanceof Error ? error.message : 'Failed to create transaction.',
      });
      setIsBurning(false);
    }
  };

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-2xl border-2 border-red-200 shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
            🔥 Burn NFT
          </CardTitle>
          <CardDescription>
            Permanently destroy your NFT. This action is irreversible on the blockchain.
          </CardDescription>
          {account && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
              <Wallet className="h-5 w-5 text-primary" />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-muted-foreground">Connected Wallet</span>
                {/* ✅ FIX: added suppressHydrationWarning to match mint pattern */}
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
                    Please connect your wallet to burn NFTs.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Warning Banner */}
            <div className="rounded-lg border-2 border-red-500/50 bg-red-50 p-4 dark:bg-red-950/20">
              <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                ⚠️ WARNING: Burning is permanent and cannot be undone!
              </p>
              <p className="mt-1 text-sm text-red-800 dark:text-red-200">
                The NFT will be deleted from the blockchain forever.
              </p>
            </div>

            {/* Ownership requirement — most common cause of burn errors */}
            <div className="rounded-lg border-2 border-yellow-500/50 bg-yellow-50 p-4 dark:bg-yellow-950/20">
              <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                📋 Requirements before burning:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                <li>
                  <strong>1.</strong> The NFT must be directly in your wallet — not listed on the marketplace.
                </li>
                <li>
                  <strong>2.</strong> If it is currently listed, go to{' '}
                  <a href="/delist" className="underline font-semibold">Delist</a>{' '}
                  first to return it to your wallet, then come back here to burn it.
                </li>
                <li>
                  <strong>3.</strong> Use the original NFT Object ID (not the Listing ID).
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nftObjectId" className="text-sm font-semibold">
                NFT Object ID
              </Label>
              <Input
                id="nftObjectId"
                placeholder="0x1234...abcd"
                value={nftObjectId}
                onChange={(e) => setNftObjectId(e.target.value)}
                disabled={isBurning}
                className="h-11 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                The original NFT Object ID — must be in your wallet, not listed on the marketplace.
              </p>
            </div>

            {/* Confirmation Checkbox */}
            <div className="flex items-start gap-3 rounded-lg border-2 border-red-300 bg-red-50 p-4 dark:bg-red-950/20">
              <input
                type="checkbox"
                id="confirm"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                disabled={isBurning}
                className="mt-1 h-4 w-4 cursor-pointer accent-red-600"
              />
              <Label
                htmlFor="confirm"
                className="cursor-pointer text-sm text-red-900 dark:text-red-100"
              >
                I understand this action is <strong>permanent and irreversible</strong>.
                I confirm I want to burn this NFT forever.
              </Label>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t bg-muted/50 pt-6">
          <Button
            variant="destructive"
            className="w-full font-semibold shadow-sm"
            size="lg"
            onClick={handleBurn}
            disabled={isBurning || !nftObjectId.trim() || !confirmed || !account}
          >
            {isBurning ? (
              'Burning on Blockchain...'
            ) : !account ? (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet to Burn
              </>
            ) : (
              <>
                <Flame className="mr-2 h-4 w-4" />
                Burn NFT Forever
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}