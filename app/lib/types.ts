export type NFT = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  price?: number;
  owner: string;
  isListed: boolean;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
};

export type User = {
  walletAddress: string;
  suiBalance: number;
};
