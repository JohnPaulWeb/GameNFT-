'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
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
  const client = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { burnNft } = useMarketplace();

  const handleBurn = async () => {
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

    setIsBurning(true);

    try {
      console.log('PACKAGE_ID:', CONTRACTS.PACKAGE_ID);
      console.log('MODULE_NAME:', CONTRACTS.MODULE_NAME);
      console.log('NETWORK:', CONTRACTS.NETWORK);
      console.log('Burning NFT:', nftObjectId);

      // Validate the object on-chain
      const objectData = await client.getObject({
        id: nftObjectId,
        options: { showOwner: true, showType: true, showContent: true },
      });

      console.log('Object data:', objectData);

      if (objectData.error || !objectData.data) {
        toast({
          variant: 'destructive',
          title: 'Object Not Found',
          description: 'This Object ID does not exist on-chain. Double-check the ID and try again.',
        });
        setIsBurning(false);
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
        const isWrapped = owner && typeof owner === 'object' && 'ObjectOwner' in owner;
        toast({
          variant: 'destructive',
          title: isWrapped ? 'NFT is Still Listed' : 'Not Your NFT',
          description: isWrapped
            ? 'This NFT is currently listed in the marketplace. Go to Delist first, then come back to burn.'
            : 'This NFT is not owned by your connected wallet address.',
        });
        setIsBurning(false);
        return;
      }

      // Verify this is actually an NFT from your contract
      const expectedNftType = `${CONTRACTS.PACKAGE_ID}::nft_marketplace::NFT`;
      console.log('Expected type:', expectedNftType);
      console.log('Actual type:', objectType);

      if (objectType !== expectedNftType) {
        toast({
          variant: 'destructive',
          title: 'Invalid NFT Type',
          description: `This object is not an NFT from this marketplace. Expected type: ${expectedNftType}`,
        });
        setIsBurning(false);
        return;
      }

      console.log('✅ Object verified — type:', objectType, '| owner:', owner);

      const tx = new Transaction();
      
      // ✅ CORRECT: No typeArguments needed since burn(nft: NFT) is not generic
      tx.moveCall({
        target: `${CONTRACTS.PACKAGE_ID}::nft_marketplace::burn`,
        arguments: [
          tx.object(nftObjectId),
        ],
      });

      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result: any) => {
            console.log('🔥 Burn successful!', result);

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
            console.error('❌ Burn failed:', error);
            
            let errorMessage = 'Transaction failed';
            
            if (error?.message) {
              const msg = error.message.toLowerCase();
              
              if (msg.includes('invalidobjectownership') || msg.includes('not owned')) {
                errorMessage = 'You do not own this NFT or it is currently listed in the marketplace. Please delist it first.';
              } else if (msg.includes('objectnotfound')) {
                errorMessage = 'NFT object not found on chain. Make sure the Object ID is correct.';
              } else if (msg.includes('insufficient') && msg.includes('gas')) {
                errorMessage = 'Insufficient gas. Please make sure you have enough SUI in your wallet.';
              } else if (msg.includes('type')) {
                errorMessage = 'Incorrect object type - this is not a valid NFT from this marketplace.';
              } else {
                errorMessage = error.message;
              }
            }
            
            toast({
              variant: 'destructive',
              title: 'Burn Failed',
              description: errorMessage,
            });
            setIsBurning(false);
          },
        }
      );
    } catch (error) {
      console.error('Error in burn:', error);
      toast({
        variant: 'destructive',
        title: 'Transaction Error',
        description: error instanceof Error ? error.message : 'Failed to create transaction.',
      });
      setIsBurning(false);
    }
  };

  return (

    // ito naman yung Card  
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

            // ito naman yung Wallet design
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

          {/* ito naman yung Burn Alert  */}
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-red-500/50 bg-red-50 p-4 dark:bg-red-950/20">
              <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                ⚠️ WARNING: Burning is permanent and cannot be undone!
              </p>
              {/* ito yung text if you want to delete from blockchain */}
              <p className="mt-1 text-sm text-red-800 dark:text-red-200">
                The NFT will be deleted from the blockchain forever.
              </p>
            </div>

            {/* ito yung text  */}
            <div className="rounded-lg border-2 border-yellow-500/50 bg-yellow-50 p-4 dark:bg-yellow-950/20">
              <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                📋 Before burning:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                <li><strong>1.</strong> The NFT must be in your wallet — not listed on the marketplace.</li>
                <li>
                  <strong>2.</strong> If currently listed, go to{' '}
                  <a href="/delist" className="underline font-semibold">Delist</a>{' '}
                  first, then come back here.
                </li>
                <li><strong>3.</strong> Use the original NFT Object ID, not a Listing ID or transaction digest.</li>
              </ul>
            </div>

            {/* ito yung label */}
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
                The original NFT Object ID — must be directly in your wallet, not listed on the marketplace.
              </p>
            </div>

            <div className="flex items-start gap-3 rounded-lg border-2 border-red-300 bg-red-50 p-4 dark:bg-red-950/20">
              <input
                type="checkbox"
                id="confirm"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                disabled={isBurning}
                className="mt-1 h-4 w-4 cursor-pointer accent-red-600"
              />

              {/* ito naman yung text */}
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

        {/* ito naman yung CardFooter */}
        <CardFooter className="border-t bg-muted/50 pt-6">
          <Button
            variant="destructive"
            className="w-full font-semibold shadow-sm"
            size="lg"
            onClick={handleBurn}
            disabled={isBurning || !nftObjectId.trim() || !confirmed || !account}
          >
            {/* ito yung burning   */}
            {isBurning ? (
              'Verifying & Burning...'
            ) : !account ? (
              <>
              {/* ito naman yung wallet */}
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet to Burn 
              </>
            ) : (
              // ito naman yung Burn-NFT
              <>
                <Flame className="mr-2 h-4 w-4" />
                Burn NFT 
              </>
              
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}