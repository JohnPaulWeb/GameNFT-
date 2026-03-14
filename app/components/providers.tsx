'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
} from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  SuiClientProvider,
  WalletProvider,
  useCurrentAccount,
  useSuiClient,
} from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui.js/client';
import type { NFT } from '@/app/lib/types';
import { useToast } from '@/app/hooks/use-toast';
import { CONTRACTS } from '@/app/components/contracts';

// Marketplace Context
interface MarketplaceContextType {
  nfts: NFT[];
  isLoading: boolean;
  refetchNfts: () => void;
  addNft: (nft: NFT) => void;
  listNft: (nft: NFT, price: number) => void;
  delistNft: (nftId: string) => void;
  buyNft: (nft: NFT) => void;
  burnNft: (nftId: string) => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(
  undefined
);

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
}

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const account = useCurrentAccount();
  const client = useSuiClient();

  // ✅ Fetch NFTs from blockchain whenever wallet connects or changes
  const fetchNfts = useCallback(async () => {
    if (!account?.address) {
      setNfts([]);
      return;
    }

    setIsLoading(true);

    try {
      // Query all NFT objects owned by the connected wallet
      const ownedObjects = await client.getOwnedObjects({
        owner: account.address,
        filter: {
          StructType: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULE_NAME}::NFT`,
        },
        options: {
          showContent: true,  // get name, description, url fields
          showType: true,
          showOwner: true,
        },
      });

      console.log('Fetched owned NFTs:', ownedObjects.data);

      const fetchedNfts: NFT[] = ownedObjects.data
        .map((obj) => {
          const content = obj.data?.content;

          // content.fields contains the Move struct fields
          if (!content || content.dataType !== 'moveObject') return null;

          const fields = content.fields as any;

          // 🔍 DEBUG — see exact raw data in browser console
          console.log('RAW fields:', JSON.stringify(fields, null, 2));
          console.log('fields.url:', fields.url, '| type:', typeof fields.url);

          // sui::url::Url serializes as { url: "https://..." } object
          const rawUrl = fields.url;
          const imageUrl =
            typeof rawUrl === 'string' ? rawUrl :
            typeof rawUrl === 'object' && rawUrl !== null ? (rawUrl.url ?? rawUrl.bytes ?? '') :
            '';

          console.log('✅ Resolved imageUrl:', imageUrl);

          return {
            id: obj.data?.objectId ?? '',
            name: fields.name ?? 'Unknown NFT',
            description: fields.description ?? '',
            imageUrl,
            imageHint: fields.name ?? '',
            owner: account.address,
            isListed: false,   // owned objects are never listed (listed = wrapped)
            rarity: 'common' as const,
          };
        })
        .filter(Boolean) as NFT[];

      console.log('Parsed NFTs:', fetchedNfts);
      setNfts(fetchedNfts);
    } catch (error) {
      console.error('Failed to fetch NFTs:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to load NFTs',
        description: 'Could not fetch your NFTs from the blockchain.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [account?.address, client, toast]);

  // ✅ Re-fetch whenever the wallet account changes (connect, disconnect, switch)
  useEffect(() => {
    fetchNfts();
  }, [fetchNfts]);

  // ✅ addNft — after mint, add directly to state (no need to refetch)
  const addNft = useCallback((nft: NFT) => {
    setNfts((prev) => [nft, ...prev]);
  }, []);

  const listNft = useCallback((nftToList: NFT, price: number) => {
    // When listed, NFT is wrapped in marketplace — remove from owned list
    setNfts((prev) => prev.filter((nft) => nft.id !== nftToList.id));
    toast({
      title: 'Item Listed!',
      description: `${nftToList.name} has been listed for ${price} SUI.`,
    });
  }, [toast]);

  const delistNft = useCallback((nftToDelistId: string) => {
    // After delist, refetch from chain so the returned NFT appears
    toast({
      title: 'Item Delisted',
      description: 'Your NFT has been returned to your wallet.',
    });
    // Small delay to let the blockchain confirm before fetching
    setTimeout(() => fetchNfts(), 1500);
  }, [fetchNfts, toast]);

  const buyNft = useCallback((nftToBuy: NFT) => {
    if (!account) {
      toast({ variant: 'destructive', title: 'Wallet not connected!' });
      return;
    }
    // Refetch after buy to get the new NFT in state
    setTimeout(() => fetchNfts(), 1500);
    toast({
      title: 'Purchase Successful!',
      description: `You have successfully purchased ${nftToBuy.name}.`,
    });
  }, [account, fetchNfts, toast]);

  const burnNft = useCallback((nftId: string) => {
    // Remove from local state immediately — no need to refetch
    setNfts((prev) => prev.filter((nft) => nft.id !== nftId));
    toast({
      title: 'NFT Burned 🔥',
      description: 'Your NFT has been permanently destroyed.',
    });
  }, [toast]);

  // ito naman yung Value   
  const value = useMemo(
    () => ({ nfts, isLoading, refetchNfts: fetchNfts, addNft, listNft, delistNft, buyNft, burnNft }),
    [nfts, isLoading, fetchNfts, addNft, listNft, delistNft, buyNft, burnNft]
  );

  // ito naman yyung MarketplaceProvider
  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
}

// ito naman QueryClient 
const queryClient = new QueryClient();
// ito naman yung networks
const networks = {
  testnet: { url: getFullnodeUrl('testnet'), network: 'testnet' as const },
};


// dito naman yung provider para sa SuiClient at WalletProvider at MarketplaceProvider para ma access sa buong app
export function Providers({ children }: { children: React.ReactNode }) {
  return (

    // ito naman yung QueryClientProvider
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <MarketplaceProvider>{children}</MarketplaceProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
} 