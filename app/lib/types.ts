// dito yung export yung para sa image 

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


// ito naman yung wallet adddress
export type User = {
  walletAddress: string;
  suiBalance: number;
};
