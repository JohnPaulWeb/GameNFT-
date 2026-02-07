import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import type { NFT } from '@/app/lib/types';
import { cn } from '@/app/lib/utils';
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
        'group flex h-full w-full max-w-[320px] flex-col overflow-hidden border-2 transition-all hover:border-primary/50 hover:shadow-xl',
        className
      )}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted/50">
        <Image
          src={nft.imageUrl}
          alt={nft.name}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          data-ai-hint={nft.imageHint}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, (max-width: 1536px) 25vw, 20vw"
          loading="lazy"
          unoptimized
        />
      </div>
      <CardHeader className="space-y-1.5 pb-4">
        <CardTitle className="line-clamp-1 text-lg font-bold">
          {nft.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 pb-4">
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
        <CardFooter className="flex-col items-stretch gap-2 border-t bg-muted/50 p-4">
          {children}
        </CardFooter>
      )}
    </Card>
  );
}
