'use client';

import Image from 'next/image';
import { useState } from 'react';
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
        'backdrop-blur-xl transition-all duration-300',
        'hover:border-cyan-400/60 hover:shadow-lg',
        'animate-fade-up',
        className
      )}
    >
      {/* Ambient glow effect */}
      <div className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 rounded-2xl blur-xl"
        style={{
          background: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      
      {/* Image container with glow */}
      <div className="relative aspect-square w-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02]">
        {/* Loading shimmer */}
        {!imageLoaded && (
          <div className="absolute inset-0 shimmer" />
        )}
        
        <Image
          src={nft.imageUrl}
          alt={nft.name}
          fill
          className={cn(
            'object-cover transition-all duration-500 ease-out',
            'group-hover:scale-110 group-hover:brightness-110',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          data-ai-hint={nft.imageHint}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, (max-width: 1536px) 25vw, 20vw"
          loading="lazy"
          unoptimized
          onLoadingComplete={() => setImageLoaded(true)}
        />
        
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        {/* Glow border on hover */}
        <div className="absolute inset-0 rounded-2xl border border-cyan-400/0 group-hover:border-cyan-400/30 transition-all duration-300"
          style={{
            boxShadow: 'inset 0 0 20px rgba(0, 240, 255, 0.1)',
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
          <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-cyan-500/10 to-transparent p-3 border border-cyan-400/20 group-hover:border-cyan-400/40 transition-colors">
            <span className="text-xs font-medium text-[hsl(var(--text-secondary))]">Price</span>
            <div className="flex items-baseline gap-1.5">
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
