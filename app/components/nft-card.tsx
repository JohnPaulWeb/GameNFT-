import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { NFT } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

type NftCardProps = {
  nft: NFT;
  children?: React.ReactNode;
  className?: string;
};

export function NftCard({ nft, children, className }: NftCardProps) {
  return (
    <Card
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg border-2 border-transparent transition-all duration-300 ease-in-out hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20',
        className
      )}
    >
      <div className="relative overflow-hidden aspect-[3/4]">
        <Image
          src={nft.imageUrl}
          alt={nft.name}
          width={600}
          height={800}
          className="object-cover object-center w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-105"
          data-ai-hint={nft.imageHint}
        />
      </div>
      <CardHeader>
        <CardTitle className="truncate font-headline text-lg">
          {nft.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        {nft.isListed && nft.price ? (
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {nft.price}
            </span>
            <span className="text-sm text-muted-foreground">SUI</span>
          </div>
        ) : (
          <Badge variant="secondary">Not Listed</Badge>
        )}
      </CardContent>
      {children && (
        <CardFooter className="flex-col items-stretch gap-2 pt-0 p-4">
          {children}
        </CardFooter>
      )}
    </Card>
  );
}
