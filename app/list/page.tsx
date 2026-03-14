'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Tag, Wallet } from 'lucide-react';
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

export default function ListPage() {
  const [nftObjectId, setNftObjectId] = useState('');
  const [price, setPrice] = useState('');
  const [isListing, setIsListing] = useState(false);

  const account = useCurrentAccount();
  const { toast } = useToast();
  const router = useRouter();
  const client = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { listNft } = useMarketplace();

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
    if (!price || isNaN(priceNum) || priceNum <= 0) {
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
      console.log('Listing NFT:', nftObjectId);
      console.log('Price:', priceNum, 'SUI');

      // Validate the NFT object
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

      // Check ownership
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

      // Verify NFT type
      const expectedNftType = `${CONTRACTS.PACKAGE_ID}::nft_marketplace::NFT`;
      if (objectType !== expectedNftType) {
        toast({
          variant: 'destructive',
          title: 'Invalid NFT Type',
          description: 'This is not a valid NFT from this marketplace.',
        });
        setIsListing(false);
        return;
      }

      console.log('✅ NFT verified, creating listing...');

      // Convert SUI to MIST (1 SUI = 1,000,000,000 MIST)
      const priceInMist = Math.floor(priceNum * 1_000_000_000);

      const tx = new Transaction();
      
      // Call the list function
      // Note: The function has generic type parameters but we don't need to pass them
      tx.moveCall({
        target: `${CONTRACTS.PACKAGE_ID}::nft_marketplace::list`,
        arguments: [
          tx.object(CONTRACTS.MARKETPLACE_ID), // marketplace object
          tx.object(nftObjectId), // nft object
          tx.pure.u64(priceInMist), // price in MIST
        ],
      });

      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result: any) => {
            console.log('✅ Listing successful!', result);

            //ito yung Get NFT data for local state
            const nftContent = objectData.data?.content;
            if (nftContent && 'fields' in nftContent) {
              const fields = nftContent.fields as any;
              listNft(
                {
                  id: nftObjectId,
                  name: fields.name || 'Unknown NFT',
                  description: fields.description || '',
                  image: fields.url || '',
                  owner: account.address,
                },
                priceNum
              );
            }

            // ito yung toast sa Listing  
            toast({
              title: 'NFT Listed! 🏷️',
              description: `Your NFT is now listed for ${priceNum} SUI.`,
            });

            setIsListing(false);
            setNftObjectId('');
            setPrice('');

            setTimeout(() => {
              router.push('/marketplace');
            }, 2000);
          },
          onError: (error: any) => {
            console.error('❌ Listing failed:', error);

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
      // ito yung transaction Error 
    } catch (error) {
      console.error('Error in list:', error);
      toast({
        variant: 'destructive',
        title: 'Transaction Error',
        description: error instanceof Error ? error.message : 'Failed to create transaction.',
      });
      setIsListing(false);
    }
  };

  // dito magsisimula yung code mo 
  return (

    // ito yung Card Header
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-2xl border-2 border-blue-200 shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            🏷️ List NFT for Sale
          </CardTitle>
          <CardDescription>
            List your NFT on the marketplace. You can delist it anytime.
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

        {/* ito naman yung CardContent */}
        <CardContent className="space-y-6">
          {!account && (
            <div className="rounded-lg border-2 border-yellow-500/50 bg-yellow-50 p-4 dark:bg-yellow-950/20">
              <div className="flex items-start gap-3">
                <Wallet className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                <div>
                  {/* ito yungd text for wallet kung di nakaconnect */}
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                    Wallet Not Connected
                  </h3>

                  {/* ito naman yung wallet kung ito ay naka connect */}
                  <p className="mt-1 text-sm text-yellow-800 dark:text-yellow-200">
                    Please connect your wallet to list NFTs.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ito yung listing requiremen */}
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-blue-500/50 bg-blue-50 p-4 dark:bg-blue-950/20">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                📋 Listing Requirements:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <li><strong>1.</strong> The NFT must be in your wallet (not already listed)</li>
                <li><strong>2.</strong> Set a price in SUI (e.g., 1.5 SUI)</li>
                <li><strong>3.</strong> You can delist anytime to get your NFT back</li>
              </ul>
            </div>

            {/* ito naman yung NFTObjectId */}
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
              {/* ito yung nft object  */}
              <p className="text-xs text-muted-foreground">
                The NFT Object ID from your wallet
              </p>
            </div>

            {/* ito naman yung text  */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-semibold">
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
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Listing price in SUI (1 SUI = 1,000,000,000 MIST)
              </p>
            </div>
          </div>
        </CardContent>

        {/* ito naman yung CardFooter */}
        <CardFooter className="border-t bg-muted/50 pt-6">
        
        {/* Ito naman yung Button */}
          <Button
            className="w-full font-semibold shadow-sm"
            size="lg"
            onClick={handleList}
            disabled={isListing || !nftObjectId.trim() || !price || !account}
          >
            {/* ito naman yung listing  */}
            {isListing ? (
              'Listing NFT...'
            ) : !account ? (
              <>

              {/* ito naman yung icon for wallet */}
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet to List
              </>
            ) : (
              <>

              {/* ito naman yung tag icon*/}
                <Tag className="mr-2 h-4 w-4" />
                List NFT for {price || '0'} SUI
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}