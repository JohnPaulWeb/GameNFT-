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
        'border border-cyan-500/20 bg-gradient-to-b from-white/[0.08] to-white/[0.02]',
        'transition-all duration-300 ease-out',
        'hover:border-cyan-400/50 hover:bg-gradient-to-b hover:from-white/[0.12] hover:to-white/[0.04]',
        'hover:shadow-[0_0_30px_rgba(34,211,238,0.3),inset_0_0_30px_rgba(34,211,238,0.1)]',
        'hover:-translate-y-2',
        'animate-fade-up',
        className
      )}
    >
      {/* Glow backdrop */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-purple-500/10 to-cyan-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-300 -z-10" />

      {/* Image Container */}
      <div className="relative aspect-square w-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.01] border-b border-cyan-500/10">
        {!imageLoaded && (
          <div className="absolute inset-0 shimmer" />
        )}

        {/* Status Badges with neon */}
        <div className="absolute inset-0 flex items-start justify-between p-3 z-10">
          {nft.rarity && (
            <div className={cn(
              'flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md transition-all duration-300 shadow-[0_0_10px_rgba(255,255,255,0.1)]',
              nft.rarity === 'legendary' && 'border-amber-400/60 bg-amber-500/90 shadow-[0_0_15px_rgba(251,146,60,0.4)]',
              nft.rarity === 'epic' && 'border-purple-400/60 bg-purple-500/90 shadow-[0_0_15px_rgba(168,85,247,0.4)]',
              nft.rarity === 'rare' && 'border-blue-400/60 bg-blue-500/90 shadow-[0_0_15px_rgba(59,130,246,0.4)]',
              nft.rarity === 'common' && 'border-slate-400/60 bg-slate-500/90 shadow-[0_0_15px_rgba(100,116,139,0.4)]'
            )}>
              <Award className="h-3.5 w-3.5" />
              <span>{nft.rarity}</span>
            </div>
          )}

          {nft.isListed && (
            <div className="flex items-center gap-1.5 rounded-full border border-cyan-400/60 bg-cyan-500/90 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.4)]">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Listed</span>
            </div>
          )}
        </div>

        {/* Image */}
        <Image
          src={nft.imageUrl}
          alt={nft.name}
          fill
          className={cn(
            'object-cover transition-all duration-700 ease-out',
            'group-hover:scale-125 group-hover:brightness-125',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          data-ai-hint={nft.imageHint}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, (max-width: 1536px) 25vw, 20vw"
          loading="lazy"
          unoptimized
          onLoadingComplete={() => setImageLoaded(true)}
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content Area */}
      <CardHeader className="space-y-2 pb-2 flex-shrink-0">
        <CardTitle className="line-clamp-2 font-display text-sm md:text-base font-bold leading-snug tracking-tight text-white group-hover:text-cyan-100 transition-colors">
          {nft.name}
        </CardTitle>
        {nft.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-white/60 group-hover:text-white/70 transition-colors">
            {nft.description}
          </p>
        )}
      </CardHeader>

      {/* Price Section - Neon styling */}
      <CardContent className="flex-grow pb-3 flex-shrink-0">
        {nft.isListed && nft.price ? (
          <div className="relative rounded-lg border border-cyan-400/40 bg-gradient-to-br from-cyan-500/15 via-cyan-500/5 to-transparent p-3 transition-all duration-300 group-hover:border-cyan-400/70 group-hover:bg-gradient-to-br group-hover:from-cyan-500/25 group-hover:via-cyan-500/10 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.13em] text-cyan-400/80 group-hover:text-cyan-300">Price</p>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-xl md:text-2xl font-black leading-none tracking-tight text-cyan-300 group-hover:text-cyan-200">
                {nft.price}
              </span>
              <span className="text-xs font-bold text-cyan-200/60 group-hover:text-cyan-200/80">SUI</span>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 transition-all duration-300 group-hover:border-white/25 group-hover:bg-white/[0.08]">
            <span className="text-[9px] font-bold uppercase tracking-wider text-white/40 group-hover:text-white/50">
              Not Listed
            </span>
          </div>
        )}
      </CardContent>

      {/* Action Button */}
      {children && (
        <CardFooter className="flex-col items-stretch gap-2 border-t border-cyan-500/10 bg-gradient-to-r from-white/[0.02] via-white/[0.01] to-transparent p-3">
          {children}
        </CardFooter>
      )}
    </Card>
  );
}
