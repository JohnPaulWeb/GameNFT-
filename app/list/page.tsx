'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Tag, Wallet } from 'lucide-react';
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

export default function ListPage() {
  const [nftObjectId, setNftObjectId] = useState('');
  const [priceInSui, setPriceInSui] = useState('');
  const [isListing, setIsListing] = useState(false);

  const account = useCurrentAccount();
  const { toast } = useToast();
  const router = useRouter();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { listNft, nfts } = useMarketplace();

  const handleList = () => {
    if (!nftObjectId.trim() || !priceInSui.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please enter the NFT Object ID and price.',
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

    const priceNumber = parseFloat(priceInSui);
    if (isNaN(priceNumber) || priceNumber <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Price',
        description: 'Please enter a valid price greater than 0.',
      });
      return;
    }

    setIsListing(true);

    try {
      // Convert SUI to MIST (1 SUI = 1,000,000,000 MIST)
      const priceInMist = BigInt(Math.floor(priceNumber * 1_000_000_000));

      console.log('Listing NFT:', nftObjectId, 'for', priceInMist, 'MIST');

      const tx = new Transaction();

      // ✅ Calls: entry fun list<T: key + store, SUI>(
      //   marketplace: &mut Marketplace<SUI>,
      //   nft: NFT,
      //   price: u64,
      //   ctx: &mut TxContext
      // )
      tx.moveCall({
        target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::list`,
        // Type arguments needed: <T (NFT type), SUI coin type>
        typeArguments: [
          `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::NFT`,
          '0x2::sui::SUI',
        ],
        arguments: [
          tx.object(CONTRACTS.MARKETPLACE_ID),   // &mut Marketplace<SUI>
          tx.object(nftObjectId),                 // NFT object (moved into marketplace)
          tx.pure(bcs.u64().serialize(priceInMist)), // price: u64
        ],
      });

      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result: any) => {
            console.log('List successful!', result);

            // Update local state
            const localNft = nfts.find((n) => n.id === nftObjectId);
            if (localNft) {
              listNft(localNft, priceNumber);
            }

            toast({
              title: 'NFT Listed! 🏷️',
              description: `Your NFT has been listed for ${priceInSui} SUI on the marketplace.`,
            });

            setIsListing(false);
            setNftObjectId('');
            setPriceInSui('');

            setTimeout(() => {
              router.push('/marketplace');
            }, 2000);
          },
          onError: (error: any) => {
            console.error('List failed:', error);
            toast({
              variant: 'destructive',
              title: 'Listing Failed',
              description: error?.message || 'Transaction failed',
            });
            setIsListing(false);
          },
        }
      );
    } catch (error) {
      console.error('Error creating list transaction:', error);
      toast({
        variant: 'destructive',
        title: 'Transaction Error',
        description: error instanceof Error ? error.message : 'Failed to create transaction.',
      });
      setIsListing(false);
    }
  };

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-2xl border-2 shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold">List NFT for Sale</CardTitle>
          <CardDescription>
            List your NFT on the Sui blockchain marketplace smart contract.
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
                    Please connect your wallet to list NFTs.
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
                disabled={isListing}
                className="h-11 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                The on-chain Object ID of your NFT (find it in your Sui wallet or explorer)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-semibold">
                Price (SUI)
              </Label>
              <Input
                id="price"
                type="number"
                placeholder="e.g., 1.5"
                min="0.000000001"
                step="0.1"
                value={priceInSui}
                onChange={(e) => setPriceInSui(e.target.value)}
                disabled={isListing}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Price in SUI (1 SUI = 1,000,000,000 MIST). A 2% marketplace fee applies.
              </p>
            </div>

            <div className="rounded-lg border-2 border-blue-500/50 bg-blue-50 p-4 dark:bg-blue-950/20">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Note:</strong> Listing transfers your NFT into the marketplace contract.
                It will be returned to you if you delist it.
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t bg-muted/50 pt-6">
          <Button
            className="w-full font-semibold shadow-sm"
            size="lg"
            onClick={handleList}
            disabled={isListing || !nftObjectId.trim() || !priceInSui.trim() || !account}
          >
            {isListing ? (
              'Listing on Blockchain...'
            ) : !account ? (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet to List
              </>
            ) : (
              <>
                <Tag className="mr-2 h-4 w-4" />
                List NFT on Marketplace
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}