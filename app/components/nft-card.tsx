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
        'border border-white/15 bg-gradient-to-br from-white/6 via-white/2 to-transparent',
        'backdrop-blur-xl transition-all duration-500 ease-out',
        'hover:border-cyan-400/70 hover:shadow-2xl hover:shadow-cyan-500/30',
        'hover:-translate-y-3 hover:scale-[1.03]',
        'animate-fade-up',
        className
      )}
    >
      {/* Enhanced ambient glow effect */}
      <div className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 rounded-2xl blur-3xl"
        style={{
          background: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.35) 0%, rgba(99, 102, 241, 0.25) 50%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      
      {/* Corner accent glow */}
      <div className="absolute top-0 right-0 w-40 h-40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
        style={{
          background: 'radial-gradient(circle at top right, rgba(16, 240, 252, 0.3), transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(40px)',
        }}
      />

      {/* Bottom accent glow */}
      <div className="absolute bottom-0 left-0 w-32 h-32 opacity-0 group-hover:opacity-75 transition-opacity duration-500 -z-10"
        style={{
          background: 'radial-gradient(circle at bottom left, rgba(236, 72, 153, 0.2), transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(30px)',
        }}
      />
      
      {/* Image container with enhanced glow */}
      <div className="relative aspect-square w-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-white/8 to-white/[0.01]">
        {/* Loading shimmer */}
        {!imageLoaded && (
          <div className="absolute inset-0 shimmer" />
        )}
        
        {/* Trending Badge (Top Right) */}
        {nft.isListed && (
          <div className="absolute top-4 right-4 z-20 animate-slide-in-right" style={{animationDelay: '0.2s'}}>
            <div className="px-3 py-1.5 rounded-lg backdrop-blur-xl bg-gradient-to-r from-cyan-500/95 to-cyan-600/85 border border-cyan-300/60 shadow-lg shadow-cyan-500/40 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-white" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Listed</span>
            </div>
          </div>
        )}
        
        {/* Rarity Badge (Top Left) */}
        {nft.rarity && (
          <div className="absolute top-4 left-4 z-20 animate-slide-in-left" style={{animationDelay: '0.1s'}}>
            <div className={cn(
              "px-3 py-1.5 rounded-lg backdrop-blur-xl border shadow-lg flex items-center gap-2 font-bold uppercase tracking-wider text-xs",
              nft.rarity === 'legendary' && "bg-gradient-to-r from-amber-500/95 to-orange-600/85 border-amber-300/60 shadow-amber-500/40 text-white",
              nft.rarity === 'epic' && "bg-gradient-to-r from-purple-500/95 to-purple-600/85 border-purple-300/60 shadow-purple-500/40 text-white",
              nft.rarity === 'rare' && "bg-gradient-to-r from-blue-500/95 to-blue-600/85 border-blue-300/60 shadow-blue-500/40 text-white",
              nft.rarity === 'common' && "bg-gradient-to-r from-slate-500/95 to-slate-600/85 border-slate-300/60 shadow-slate-500/40 text-white"
            )}>
              <Award className="h-4 w-4" />
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
            'group-hover:scale-[1.08] group-hover:brightness-110 group-hover:saturate-110',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          data-ai-hint={nft.imageHint}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, (max-width: 1536px) 25vw, 20vw"
          loading="lazy"
          unoptimized
          onLoadingComplete={() => setImageLoaded(true)}
        />
        
        {/* Enhanced gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        
        {/* Glow edge highlight */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none border-2 border-white/0 group-hover:border-cyan-400/50 transition-all duration-500 shadow-inset" />
        
        {/* Premium shine effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background: 'linear-gradient(135deg, transparent 30%, rgba(255, 255, 255, 0.15) 50%, transparent 70%)',
            transform: 'translateX(-100%) translateY(-100%)',
            animation: 'shine 3s ease-in-out infinite',
          }}
        />
      </div>
      
      <CardHeader className="space-y-3 pb-3">
        <CardTitle className="line-clamp-2 text-lg font-bold font-display tracking-tight leading-snug text-white">
          {nft.name}
        </CardTitle>
        {nft.description && (
          <p className="line-clamp-2 text-sm text-white/70 leading-relaxed font-light">
            {nft.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="flex-grow pb-4">
        {nft.isListed && nft.price ? (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500/20 via-cyan-500/10 to-transparent p-4 border border-cyan-400/30 group-hover:border-cyan-400/60 transition-all duration-300 backdrop-blur-sm">
            {/* Animated shimmer on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(0, 240, 255, 0.15) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s ease-in-out infinite',
              }}
            />
            <div className="flex items-center justify-between relative z-10">
              <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Sale Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-cyan-300 font-display tabular">
                  {nft.price}
                </span>
                <span className="text-sm font-bold text-cyan-200/80">SUI</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-white/8 to-white/3 border border-white/15 backdrop-blur-sm">
            <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
              ◆ Not Listed
            </span>
          </div>
        )}
      </CardContent>
      
      {children && (
        <CardFooter className="flex-col items-stretch gap-3 border-t border-white/15 bg-gradient-to-t from-white/8 to-transparent p-4">
          {children}
        </CardFooter>
      )}
    </Card>
  );
}
