'use client';

import Image from 'next/image';
import { useState } from 'react';
import { TrendingUp, Award, Wallet, Sparkles } from 'lucide-react';
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

function shortenAddress(address: string) {
  if (!address) return 'Unknown';
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function rarityPillStyles(rarity?: NFT['rarity']) {
  if (!rarity) {
    return 'border-white/20 bg-black/30 text-white/80';
  }

  const map: Record<NonNullable<NFT['rarity']>, string> = {
    legendary: 'border-amber-300/50 bg-amber-400/20 text-amber-100',
    epic: 'border-fuchsia-300/45 bg-fuchsia-500/20 text-fuchsia-100',
    rare: 'border-sky-300/45 bg-sky-500/20 text-sky-100',
    common: 'border-slate-300/35 bg-slate-400/15 text-slate-100',
  };

  return map[rarity];
}

export function NftCard({ nft, children, className }: NftCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Card
      className={cn(
        'group relative flex h-full w-full flex-col overflow-hidden rounded-2xl',
        'border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.03]',
        'shadow-[0_20px_45px_rgba(2,8,20,0.35)] backdrop-blur-xl',
        'transition-all duration-400 ease-out',
        'hover:-translate-y-1.5 hover:border-cyan-300/35',
        'hover:shadow-[0_30px_65px_rgba(2,8,20,0.5),0_0_28px_rgba(13,219,208,0.14)]',
        'animate-fade-up',
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(13,219,208,0.15),transparent_45%)] opacity-70" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />

      <div className="relative aspect-square w-full flex-shrink-0 overflow-hidden border-b border-white/10 bg-gradient-to-br from-white/10 to-white/[0.02]">
        {!imageLoaded && (
          <div className="absolute inset-0 shimmer" />
        )}

        <div className="absolute inset-x-3 top-3 z-20 flex items-start justify-between gap-2">
          {nft.rarity && (
            <div className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] backdrop-blur-md',
              rarityPillStyles(nft.rarity)
            )}>
              <Award className="h-3 w-3" />
              <span>{nft.rarity}</span>
            </div>
          )}

          {nft.isListed && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/40 bg-emerald-500/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-50 backdrop-blur-md">
              <TrendingUp className="h-3 w-3" />
              <span>Listed</span>
            </div>
          )}
        </div>

        <div className="absolute bottom-3 left-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/35 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/85 backdrop-blur-md">
          <Sparkles className="h-3 w-3 text-cyan-200" />
          <span>Sui Collection</span>
        </div>

        <Image
          src={nft.imageUrl}
          alt={nft.name}
          fill
          className={cn(
            'object-cover transition-all duration-700 ease-out',
            'group-hover:scale-110 group-hover:brightness-110',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          data-ai-hint={nft.imageHint}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, (max-width: 1536px) 25vw, 20vw"
          loading="lazy"
          unoptimized
          onLoadingComplete={() => setImageLoaded(true)}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />
      </div>

      <CardHeader className="z-10 flex-shrink-0 space-y-3 pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-white/70">
            <Wallet className="h-3 w-3 text-cyan-200/80" />
            <span>{shortenAddress(nft.owner)}</span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.15em] text-white/45">#{nft.id.slice(0, 6)}</span>
        </div>

        <CardTitle className="line-clamp-2 font-display text-base font-bold leading-snug tracking-tight text-white transition-colors group-hover:text-cyan-100 md:text-lg">
          {nft.name}
        </CardTitle>

        {nft.description?.trim() && (
          <p className="line-clamp-2 text-xs leading-relaxed text-white/60 transition-colors group-hover:text-white/75 md:text-sm">
            {nft.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="z-10 flex flex-grow flex-col justify-end pb-3">
        {nft.isListed && nft.price ? (
          <div className="rounded-xl border border-cyan-300/30 bg-gradient-to-br from-cyan-400/15 via-cyan-400/8 to-transparent p-3 transition-all duration-300 group-hover:border-cyan-200/45 group-hover:from-cyan-400/25">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-200/90">Current Price</p>
              <span className="text-[10px] uppercase tracking-[0.14em] text-cyan-100/60">Live</span>
            </div>
            <div className="flex items-end justify-between gap-3">
              <span className="font-display text-2xl font-black leading-none tracking-tight text-cyan-100 md:text-[1.7rem]">
                {nft.price}
              </span>
              <span className="mb-0.5 text-xs font-semibold tracking-[0.14em] text-cyan-100/70">SUI</span>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-white/15 bg-white/[0.03] px-3 py-2.5 transition-all duration-300 group-hover:border-white/25 group-hover:bg-white/[0.06]">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
              Not Listed
            </span>
          </div>
        )}
      </CardContent>

      {children && (
        <CardFooter className="z-10 flex-col items-stretch gap-2 border-t border-white/10 bg-gradient-to-r from-white/[0.04] via-white/[0.015] to-transparent p-3">
          {children}
        </CardFooter>
      )}
    </Card>
  );
}
