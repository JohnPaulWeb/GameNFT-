'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { XCircle, Wallet } from 'lucide-react';
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
import { useToast } from '@/app/hooks/use-toast';
import { CONTRACTS } from '@/app/components/contracts';

export default function DelistPage() {
  const [nftObjectId, setNftObjectId] = useState('');
  const [isDelisting, setIsDelisting] = useState(false);

  const account = useCurrentAccount();
  const { toast } = useToast();
  const router = useRouter();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { delistNft } = useMarketplace();

  const handleDelist = () => {
    if (!nftObjectId.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please enter the NFT Object ID to delist.',
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
      console.log('Delisting NFT:', nftObjectId);

      const tx = new Transaction();

      // ✅ Calls: entry fun delist_and_take<T: key + store, SUI>(
      //   marketplace: &mut Marketplace<SUI>,
      //   nft_id: ID,
      //   ctx: &TxContext
      // )
      // nft_id is passed as a 32-byte address using bcs bytes
      tx.moveCall({
        target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::delist_and_take`,
        typeArguments: [
          `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::NFT`,
          '0x2::sui::SUI',
        ],
        arguments: [
          tx.object(CONTRACTS.MARKETPLACE_ID),                    // &mut Marketplace<SUI>
          tx.pure(bcs.Address.serialize(nftObjectId)),            // nft_id: ID (32-byte address)
        ],
      });

      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result: any) => {
            console.log('Delist successful!', result);

            // Update local state
            delistNft(nftObjectId);

            toast({
              title: 'NFT Delisted! ✅',
              description: 'Your NFT has been removed from the marketplace and returned to your wallet.',
            });

            setIsDelisting(false);
            setNftObjectId('');

            setTimeout(() => {
              router.push('/my-nfts');
            }, 2000);
          },
          onError: (error: any) => {
            console.error('Delist failed:', error);
            toast({
              variant: 'destructive',
              title: 'Delist Failed',
              description: error?.message || 'Transaction failed',
            });
            setIsDelisting(false);
          },
        }
      );
    } catch (error) {
      console.error('Error creating delist transaction:', error);
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
      <Card className="w-full max-w-2xl border-2 shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold">Delist NFT</CardTitle>
          <CardDescription>
            Remove your NFT from the marketplace. It will be returned to your wallet.
          </CardDescription>
          {account && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
              <Wallet className="h-5 w-5 text-primary" />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-muted-foreground">Connected Wallet</span>
                <span className="font-mono text-sm font-semibold">
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

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nftObjectId" className="text-sm font-semibold">
                NFT Object ID
              </Label>
              <Input
                id="nftObjectId"
                placeholder="0x1234...abcd"
                value={nftObjectId}
                onChange={(e) => setNftObjectId(e.target.value)}
                disabled={isDelisting}
                className="h-11 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                The Object ID of the NFT you want to remove from the marketplace.
              </p>
            </div>

            <div className="rounded-lg border-2 border-orange-500/50 bg-orange-50 p-4 dark:bg-orange-950/20">
              <p className="text-sm text-orange-900 dark:text-orange-100">
                <strong>Note:</strong> Only you (the original seller) can delist your NFT.
                The NFT will be transferred back to your wallet automatically.
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t bg-muted/50 pt-6">
          <Button
            variant="destructive"
            className="w-full font-semibold shadow-sm"
            size="lg"
            onClick={handleDelist}
            disabled={isDelisting || !nftObjectId.trim() || !account}
          >
            {isDelisting ? (
              'Delisting from Blockchain...'
            ) : !account ? (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet to Delist
              </>
            ) : (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Delist NFT from Marketplace
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}