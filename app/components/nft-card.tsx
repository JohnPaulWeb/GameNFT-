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
        'group flex h-full w-full max-w-[320px] flex-col overflow-hidden border transition-all duration-300 hover:border-primary hover:shadow-2xl',
        className
      )}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-muted/80 to-muted/40">
        <Image
          src={nft.imageUrl}
          alt={nft.name}
          fill
          className="object-cover transition-all duration-500 ease-out group-hover:scale-105"
          data-ai-hint={nft.imageHint}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, (max-width: 1536px) 25vw, 20vw"
          loading="lazy"
          unoptimized
        />
        {/* Overlay gradient for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
      <CardHeader className="space-y-1.5 pb-3">
        <CardTitle className="line-clamp-1 text-lg font-bold">
          {nft.name}
        </CardTitle>
        {nft.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {nft.description}
          </p>
        )}
      </CardHeader>
      <CardContent className="flex-grow pb-4">
        {nft.isListed && nft.price ? (
          <div className="flex items-center justify-between rounded-lg bg-primary/5 p-3">
            <span className="text-xs font-medium text-muted-foreground">Price</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-foreground">
                {nft.price}
              </span>
              <span className="text-sm font-medium text-muted-foreground">SUI</span>
            </div>
          </div>
        ) : (
          <Badge variant="secondary" className="w-fit">
            Not Listed
          </Badge>
        )}
      </CardContent>
      {children && (
        <CardFooter className="flex-col items-stretch gap-2 border-t bg-muted/30 p-4">
          {children}
        </CardFooter>
      )}
    </Card>
  );
}
