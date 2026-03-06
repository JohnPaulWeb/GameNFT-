'use client';

import Image from 'next/image';
import { useState } from 'react';
import { TrendingUp, Award } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import type { NFT } from '@/app/lib/types';
import { cn } from '@/app/lib/utils';

type NftCardProps = {
  nft: NFT;
  children?: React.ReactNode;
  className?: string;
};

export function NftCard({ nft, children, className }: NftCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Card
      className={cn(
        'group relative flex h-full w-full flex-col overflow-hidden rounded-lg',
        'border border-[hsl(var(--border-default))] bg-[hsl(var(--bg-secondary))] backdrop-blur-sm',
        'transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[hsl(var(--accent-indigo)_/_0.4)]',
        'animate-fade-up',
        className
      )}
    >
      <div className="relative aspect-square w-full flex-shrink-0 overflow-hidden bg-white/5">
        {!imageLoaded && (
          <div className="absolute inset-0 shimmer" />
        )}

        {nft.isListed && (
          <div className="absolute right-3 top-3 z-20">
            <div className="flex items-center gap-1 rounded-full border border-[hsl(var(--accent-indigo)_/_0.4)] bg-[hsl(var(--accent-indigo)_/_0.15)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--accent-indigo))] backdrop-blur-sm">
              <TrendingUp className="h-3 w-3" />
              <span>Listed</span>
            </div>
          </div>
        )}

        {nft.rarity && (
          <div className="absolute left-3 top-3 z-20">
            <div className={cn(
              'flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm',
              nft.rarity === 'legendary' && 'border-[hsl(var(--accent-gold)_/_0.3)] bg-[hsl(var(--accent-gold)_/_0.15)] text-[hsl(var(--accent-gold))]',
              nft.rarity === 'epic' && 'border-[hsl(var(--accent-rose)_/_0.3)] bg-[hsl(var(--accent-rose)_/_0.15)] text-[hsl(var(--accent-rose))]',
              nft.rarity === 'rare' && 'border-[hsl(var(--accent-indigo)_/_0.3)] bg-[hsl(var(--accent-indigo)_/_0.15)] text-[hsl(var(--accent-indigo))]',
              nft.rarity === 'common' && 'border-[hsl(var(--text-muted)_/_0.3)] bg-[hsl(var(--text-muted)_/_0.1)] text-[hsl(var(--text-secondary))]'
            )}>
              <Award className="h-3 w-3" />
              <span>{nft.rarity}</span>
            </div>
          </div>
        )}
        
        <Image
          src={nft.imageUrl}
          alt={nft.name}
          fill
          className={cn(
            'object-cover transition-all duration-700 ease-out',
            'group-hover:scale-105 group-hover:brightness-105',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          data-ai-hint={nft.imageHint}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, (max-width: 1536px) 25vw, 20vw"
          loading="lazy"
          unoptimized
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <CardHeader className="space-y-2 pb-3">
        <CardTitle className="line-clamp-2 font-display text-base font-semibold leading-snug tracking-tight text-white">
          {nft.name}
        </CardTitle>
        {nft.description && (
          <p className="line-clamp-2 text-xs font-normal leading-relaxed text-[hsl(var(--text-secondary))]">
            {nft.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-grow pb-4">
        {nft.isListed && nft.price ? (
          <div className="rounded-lg border border-[hsl(var(--accent-cyan)_/_0.25)] bg-[hsl(var(--accent-cyan)_/_0.08)] p-3 transition-colors duration-300 group-hover:border-[hsl(var(--accent-cyan)_/_0.4)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--text-secondary))]">Price</span>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-2xl font-semibold text-[hsl(var(--accent-cyan))]">
                  {nft.price}
                </span>
                <span className="text-xs font-medium text-[hsl(var(--text-secondary))]">SUI</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-[hsl(var(--border-default))] bg-[hsl(var(--bg-tertiary))] px-3 py-2.5 backdrop-blur-sm">
            <span className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--text-muted))]">
              Not Listed
            </span>
          </div>
        )}
      </CardContent>

      {children && (
        <CardFooter className="flex-col items-stretch gap-2 border-t border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-primary)_/_0.5)] p-3">
          {children}
        </CardFooter>
      )}
    </Card>
  );
}
