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

  // dito magsisimula yung code mo for the NftCard component
  return (
    <Card
      className={cn(
        'group relative flex h-full w-full flex-col overflow-hidden rounded-2xl',
        'border border-white/[0.09] bg-white/[0.03]',
        'transition-all duration-300 ease-out hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-white/[0.05]',
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

        {/* ito yung NFT rarity badge */}
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
        
        {/* ito yung Image */}
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

      {/* ito yung CardHeader */}
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

      {/* ito yung CardContent  */}
      <CardContent className="flex-grow pb-4">
        {nft.isListed && nft.price ? (
          <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.07] px-5 py-4 transition-colors duration-300 group-hover:border-cyan-400/40 group-hover:bg-cyan-400/[0.10]">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-400/70">Sale Price</p>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl font-bold leading-none tracking-tight text-cyan-300">
                {nft.price}
              </span>
              <span className="text-sm font-bold text-cyan-200/70">SUI</span>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/35">
              Not Listed
            </span>
          </div>
        )}
      </CardContent>

      {/* ito yung Card Footer */}
      {children && (
        <CardFooter className="flex-col items-stretch gap-3 border-t border-white/[0.07] bg-transparent p-4">
          {children}
        </CardFooter>
      )}
    </Card>
  );
}
