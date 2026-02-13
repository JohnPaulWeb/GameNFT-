'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useCallback,
} from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  SuiClientProvider,
  WalletProvider,
  useCurrentAccount,
} from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui.js/client';
import type { NFT } from '@/app/lib/types';
import { useToast } from '@/app/hooks/use-toast';

// Marketplace Context
interface MarketplaceContextType {
  nfts: NFT[];
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
  const { toast } = useToast();
  const account = useCurrentAccount();

  const addNft = useCallback((nft: NFT) => {
    setNfts((prevNfts) => [nft, ...prevNfts]);
    toast({
      title: 'Mint Successful!',
      description: `You have successfully minted: ${nft.name}`,
    });
  }, [toast]);

  const listNft = useCallback((nftToList: NFT, price: number) => {
    setNfts((prevNfts) =>
      prevNfts.map((nft) =>
        nft.id === nftToList.id ? { ...nft, isListed: true, price: price } : nft
      )
    );
    toast({
      title: 'Item Listed!',
      description: `${nftToList.name} has been listed for ${price} SUI.`,
    });
  }, [toast]);

  const delistNft = useCallback((nftToDelistId: string) => {
    const nftToDelist = nfts.find((nft) => nft.id === nftToDelistId);
    setNfts((prevNfts) =>
      prevNfts.map((nft) =>
        nft.id === nftToDelistId
          ? { ...nft, isListed: false, price: undefined }
          : nft
      )
    );
    if (nftToDelist) {
      toast({
        title: 'Item Delisted',
        description: `${nftToDelist.name} has been removed from the marketplace.`,
      });
    }
  }, [nfts, toast]);

  const buyNft = useCallback((nftToBuy: NFT) => {
    if (!account) {
      toast({ variant: 'destructive', title: 'Wallet not connected!' });
      return;
    }
    setNfts((prevNfts) =>
      prevNfts.map((nft) =>
        nft.id === nftToBuy.id
          ? { ...nft, owner: account.address, isListed: false, price: undefined }
          : nft
      )
    );
    toast({
      title: 'Purchase Successful!',
      description: `You have successfully purchased ${nftToBuy.name}.`,
    });
  }, [account, toast]);

  const burnNft = useCallback((nftId: string) => {
    const nftToBurn = nfts.find((n) => n.id === nftId);
    setNfts((prevNfts) => prevNfts.filter((nft) => nft.id !== nftId));
    if (nftToBurn) {
      toast({
        title: 'NFT Burned',
        description: `${nftToBurn.name} has been permanently destroyed.`,
      });
    }
  }, [nfts, toast]);

  const value = useMemo(
    () => ({ nfts, addNft, listNft, delistNft, buyNft, burnNft }),
    [nfts, addNft, listNft, delistNft, buyNft, burnNft]
  );

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
}

// Providers
const queryClient = new QueryClient();

// ✅ Only keep testnet — removes devnet/mainnet to avoid accidental wrong network
const networks = {
  testnet: { url: getFullnodeUrl('testnet'), network: 'testnet' as const },
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="testnet"> {/* ✅ Fixed: was "devnet" */}
        <WalletProvider autoConnect>
          <MarketplaceProvider>{children}</MarketplaceProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}