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
        'group relative flex h-full w-full flex-col overflow-hidden rounded-2xl',
        'border border-white/10 bg-black/25 backdrop-blur-xl',
        'transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-cyan-400/45',
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
            <div className="flex items-center gap-1.5 rounded-full border border-cyan-300/30 bg-cyan-500/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-xl">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Listed</span>
            </div>
          </div>
        )}

        {nft.rarity && (
          <div className="absolute left-3 top-3 z-20">
            <div className={cn(
              'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-xl',
              nft.rarity === 'legendary' && 'border-amber-300/40 bg-amber-500/85',
              nft.rarity === 'epic' && 'border-purple-300/40 bg-purple-500/85',
              nft.rarity === 'rare' && 'border-blue-300/40 bg-blue-500/85',
              nft.rarity === 'common' && 'border-slate-300/40 bg-slate-500/85'
            )}>
              <Award className="h-3.5 w-3.5" />
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
          onLoadingComplete={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <CardHeader className="space-y-3 pb-3">
        <CardTitle className="line-clamp-2 font-display text-lg font-bold leading-snug tracking-tight text-white">
          {nft.name}
        </CardTitle>
        {nft.description && (
          <p className="line-clamp-2 text-sm font-light leading-relaxed text-white/70">
            {nft.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-grow pb-4">
        {nft.isListed && nft.price ? (
          <div className="rounded-xl border border-cyan-400/25 bg-cyan-500/10 p-4 transition-colors duration-300 group-hover:border-cyan-400/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/65">Sale Price</span>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-bold text-cyan-300">
                  {nft.price}
                </span>
                <span className="text-sm font-bold text-cyan-200/80">SUI</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
              Not Listed
            </span>
          </div>
        )}
      </CardContent>

      {children && (
        <CardFooter className="flex-col items-stretch gap-3 border-t border-white/10 bg-white/[0.02] p-4">
          {children}
        </CardFooter>
      )}
    </Card>
  );
}
