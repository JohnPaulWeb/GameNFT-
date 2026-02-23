'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Flame, TrendingUp, Award } from 'lucide-react';
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
  const [imageLoaded, setImageLoaded] = useState(false);
  
  return (
    <Card
      className={cn(
        'group relative flex h-full w-full flex-col overflow-hidden rounded-2xl',
        'border border-white/10 bg-gradient-to-br from-white/5 to-transparent',
        'backdrop-blur-xl transition-all duration-500 ease-out',
        'hover:border-cyan-400/60 hover:shadow-2xl hover:shadow-cyan-400/20',
        'hover:-translate-y-2 hover:scale-[1.02]',
        'animate-fade-up',
        className
      )}
    >
      {/* Enhanced ambient glow effect */}
      <div className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 rounded-2xl blur-2xl"
        style={{
          background: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.3) 0%, rgba(99, 102, 241, 0.2) 50%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      
      {/* Corner accent glow */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
        style={{
          background: 'radial-gradient(circle at top right, rgba(16, 240, 252, 0.2), transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(30px)',
        }}
      />
      
      {/* Image container with enhanced glow */}
      <div className="relative aspect-square w-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02]">
        {/* Loading shimmer */}
        {!imageLoaded && (
          <div className="absolute inset-0 shimmer" />
        )}
        
        {/* Trending Badge (Top Right) */}
        {nft.isListed && (
          <div className="absolute top-3 right-3 z-10">
            <div className="px-2.5 py-1 rounded-lg backdrop-blur-xl bg-gradient-to-r from-cyan-500/90 to-cyan-600/90 border border-cyan-400/50 shadow-lg shadow-cyan-400/25 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-white" />
              <span className="text-xs font-bold text-white">Listed</span>
            </div>
          </div>
        )}
        
        {/* Rarity Badge (Top Left) */}
        {nft.rarity && (
          <div className="absolute top-3 left-3 z-10">
            <div className={cn(
              "px-2.5 py-1 rounded-lg backdrop-blur-xl border shadow-lg flex items-center gap-1.5",
              nft.rarity === 'legendary' && "bg-gradient-to-r from-amber-500/90 to-orange-600/90 border-amber-400/50 shadow-amber-400/25",
              nft.rarity === 'epic' && "bg-gradient-to-r from-purple-500/90 to-purple-600/90 border-purple-400/50 shadow-purple-400/25",
              nft.rarity === 'rare' && "bg-gradient-to-r from-blue-500/90 to-blue-600/90 border-blue-400/50 shadow-blue-400/25",
              nft.rarity === 'common' && "bg-gradient-to-r from-slate-500/90 to-slate-600/90 border-slate-400/50 shadow-slate-400/25"
            )}>
              <Award className="h-3.5 w-3.5 text-white" />
              <span className="text-xs font-bold text-white capitalize">{nft.rarity}</span>
            </div>
          </div>
        )}
        
        <Image
          src={nft.imageUrl}
          alt={nft.name}
          fill
          className={cn(
            'object-cover transition-all duration-700 ease-out',
            'group-hover:scale-[1.15] group-hover:brightness-110 group-hover:saturate-110',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          data-ai-hint={nft.imageHint}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, (max-width: 1536px) 25vw, 20vw"
          loading="lazy"
          unoptimized
          onLoadingComplete={() => setImageLoaded(true)}
        />
        
        {/* Enhanced gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        
        {/* Animated glow border on hover */}
        <div className="absolute inset-0 rounded-t-2xl border-2 border-cyan-400/0 group-hover:border-cyan-400/40 transition-all duration-500"
          style={{
            boxShadow: '0 0 0 rgba(0, 240, 255, 0)',
          }}
        />
        
        {/* Shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background: 'linear-gradient(135deg, transparent 40%, rgba(255, 255, 255, 0.1) 50%, transparent 60%)',
            transform: 'translateX(-100%)',
            animation: 'shine 2s ease-in-out infinite',
          }}
        />
      </div>
      
      <CardHeader className="space-y-2 pb-2">
        <CardTitle className="line-clamp-2 text-lg md:text-xl font-bold font-display tracking-tight leading-snug">
          {nft.name}
        </CardTitle>
        {nft.description && (
          <p className="line-clamp-2 text-xs md:text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
            {nft.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="flex-grow pb-3">
        {nft.isListed && nft.price ? (
          <div className="relative overflow-hidden flex items-center justify-between rounded-xl bg-gradient-to-r from-cyan-500/10 to-transparent p-3 border border-cyan-400/20 group-hover:border-cyan-400/40 transition-colors">
            {/* Animated shimmer on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(0, 240, 255, 0.1) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s ease-in-out infinite',
              }}
            />
            <span className="text-xs font-medium text-[hsl(var(--text-secondary))] z-10">Price</span>
            <div className="flex items-baseline gap-1.5 z-10">
              <span className="text-2xl md:text-3xl font-bold text-cyan-300 font-display">
                {nft.price}
              </span>
              <span className="text-sm font-semibold text-cyan-200/70">SUI</span>
            </div>
          </div>
        ) : (
          <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">
            <span className="text-xs font-semibold text-[hsl(var(--text-secondary))]">
              Not Listed
            </span>
          </div>
        )}
      </CardContent>
      
      {children && (
        <CardFooter className="flex-col items-stretch gap-2 border-t border-white/10 bg-gradient-to-t from-white/5 to-transparent p-4">
          {children}
        </CardFooter>
      )}
    </Card>
  );
}
