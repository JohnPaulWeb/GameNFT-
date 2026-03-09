'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { PackageX, Wallet } from 'lucide-react';
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

export default function DelistPage() {
  const [nftId, setNftId] = useState('');
  const [isDelisting, setIsDelisting] = useState(false);

  const account = useCurrentAccount();
  const { toast } = useToast();
  const router = useRouter();
  const client = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { delistNft } = useMarketplace();

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
      console.log('Delisting NFT ID:', nftId);

      // First check if the listing exists in the marketplace
      const marketplaceData = await client.getObject({
        id: CONTRACTS.MARKETPLACE_ID,
        options: { showContent: true },
      });

      console.log('Marketplace data:', marketplaceData);

      const tx = new Transaction();
      
      // Call delist_and_take function
      // Note: nft_id parameter is the ID (UID) of the NFT, not the listing object
      tx.moveCall({
        target: `${CONTRACTS.PACKAGE_ID}::nft_marketplace::delist_and_take`,
        arguments: [
          tx.object(CONTRACTS.MARKETPLACE_ID), // marketplace object
          tx.pure.id(nftId), // NFT ID (not listing ID)
        ],
      });

      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result: any) => {
            console.log('✅ Delist successful!', result);

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
            console.error('❌ Delist failed:', error);

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
      console.error('Error in delist:', error);
      toast({
        variant: 'destructive',
        title: 'Transaction Error',
        description: error instanceof Error ? error.message : 'Failed to create transaction.',
      });
      setIsDelisting(false);
    }
  };

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-2xl border-2 border-orange-200 shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            📦 Delist NFT
          </CardTitle>
          <CardDescription>
            Remove your NFT from the marketplace. The NFT will be returned to your wallet.
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
                    Please connect your wallet to delist NFTs.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ito naman yung Delist */}
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-orange-500/50 bg-orange-50 p-4 dark:bg-orange-950/20">
              <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                📋 Important Notes:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-orange-800 dark:text-orange-200">
                <li><strong>1.</strong> You can only delist NFTs that you listed</li>
                <li><strong>2.</strong> Enter the original NFT ID (not the listing object ID)</li>
                <li><strong>3.</strong> The NFT will be returned to your wallet after delisting</li>
                <li><strong>4.</strong> This action is free except for gas fees</li>
              </ul>
            </div>

            {/* ito naman yung text */}
            <div className="rounded-lg border-2 border-blue-500/50 bg-blue-50 p-4 dark:bg-blue-950/20">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                💡 How to find your NFT ID:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <li>• Go to the Marketplace and find your listed NFT</li>
                <li>• Copy the NFT ID shown in the listing details</li>
                <li>• Or check your transaction history when you listed it</li>
              </ul>
            </div>


            {/* ito naman yung NFT ID  */}
            <div className="space-y-2">
              {/* ito yung Label */}
              <Label htmlFor="nftId" className="text-sm font-semibold">
                NFT ID
              </Label>
              <Input
                id="nftId"
                placeholder="0x1234...abcd"
                value={nftId}
                onChange={(e) => setNftId(e.target.value)}
                disabled={isDelisting}
                className="h-11 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                The original NFT ID UID - the same ID used when listing
              </p>
            </div>
          </div>
        </CardContent>

        {/* ito yung CardFooter */}
        <CardFooter className="border-t bg-muted/50 pt-6">
          <Button
            variant="outline"
            className="w-full font-semibold shadow-sm border-orange-500 text-orange-600 hover:bg-orange-50"
            size="lg"
            onClick={handleDelist}
            disabled={isDelisting || !nftId.trim() || !account}
          >
            {isDelisting ? (
              'Delisting NFT...'
            ) : !account ? (
              <>
              {/* ito naman yung icon ng wallet */}
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet to Delist
              </>
            ) : (
              <>

              {/* ito naman yung icon ng packageX */}
                <PackageX className="mr-2 h-4 w-4" />
                Delist NFT
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}