import type { NFT, User } from './types';
import { PlaceHolderImages } from './placeholder-images';

export const mockUser: User = {
  walletAddress: '0xa760c3344de19543765340179f95acc80ccacb9a727ee34e2f6087179feeab89',
  suiBalance: 150.75,
};

// ito naman yung Image 
const getImage = (index: number) => PlaceHolderImages[index] || PlaceHolderImages[0];



// ito naman yung Address
const otherUserAddress = '0xabcde6789012345678901234567890123456789012345678901234567890fghij';


// ito naman yung mockNft
export const mockNfts: NFT[] = [
  {
    id: 'nft-1',
    name: 'Sword of a Thousand Truths',
    description: getImage(0).description,
    imageUrl: getImage(0).imageUrl,
    imageHint: getImage(0).imageHint,
    owner: '0x-other-user-address-1',
    isListed: true,
    price: 0.1,
  },
  {
    id: 'nft-2',
    name: 'Aegis of the Immortal',
    description: getImage(1).description,
    imageUrl: getImage(1).imageUrl,
    imageHint: getImage(1).imageHint,
    owner: '0x-other-user-address-2',
    isListed: false,
  },
  {
    id: 'nft-3',
    name: 'Elixir of Vigor',
    description: getImage(2).description,
    imageUrl: getImage(2).imageUrl,
    imageHint: getImage(2).imageHint,
    owner: otherUserAddress,
    isListed: true,
    price: 0.2,
  },
  {
    id: 'nft-4',
    name: 'Dragonfire Helm',
    description: getImage(3).description,
    imageUrl: getImage(3).imageUrl,
    imageHint: getImage(3).imageHint,
    owner: otherUserAddress,
    isListed: true,
    price: 88,
  },
  {
    id: 'nft-5',
    name: 'Boots of Hermes',
    description: getImage(4).description,
    imageUrl: getImage(4).imageUrl,
    imageHint: getImage(4).imageHint,
    owner: '0x-other-user-address-3',
    isListed: true,
    price: 35,
  },
  {
    id: 'nft-6',
    name: 'Archmage Staff',
    description: getImage(5).description,
    imageUrl: getImage(5).imageUrl,
    imageHint: getImage(5).imageHint,
    owner: otherUserAddress,
    isListed: true,
    price: 0.3,
  },
  {
    id: 'nft-7',
    name: "Eagle's Eye Bow",
    description: getImage(6).description,
    imageUrl: getImage(6).imageUrl,
    imageHint: getImage(6).imageHint,
    owner: otherUserAddress,
    isListed: true,
    price: 75,
  },
  {
    id: 'nft-8',
    name: 'Ring of Arcane Power',
    description: getImage(7).description,
    imageUrl: getImage(7).imageUrl,
    imageHint: getImage(7).imageHint,
    owner: otherUserAddress,
    isListed: true,
    price: 0.4,
  },
];
