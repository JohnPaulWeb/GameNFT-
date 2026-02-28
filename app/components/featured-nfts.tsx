'use client';

import Image from 'next/image';
import { TrendingUp, Flame, Sparkles } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface FeaturedNFT {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  volume24h?: number;
  floorPrice?: number;
  isHot?: boolean;
}

interface FeaturedNFTsProps {
  items?: FeaturedNFT[];
  onItemClick?: (id: string) => void;
}

export function FeaturedNFTs({ items = [], onItemClick }: FeaturedNFTsProps) {
  // Sample featured items if none provided
  const featuredItems =  items.length > 0 ? items : [
    {
      id: '1',
      name: 'Legendary Dragon',
      imageUrl: 'https://images.unsplash.com/photo-1578321272176-b7e46a0e6b0a?w=500&h=500&fit=crop',
      price: 25.5,
      volume24h: 425.3,
      isHot: true,
    },
    {
      id: '2',
      name: 'Mystic Phoenix',
      imageUrl: 'https://images.unsplash.com/photo-1578909372992-342f049e5d58?w=500&h=500&fit=crop',
      price: 18.2,
      volume24h: 312.5,
    },
    {
      id: '3',
      name: 'Golden Artifact',
      imageUrl: 'https://images.unsplash.com/photo-1576627537635-e75b99debbd0?w=500&h=500&fit=crop',
      price: 12.8,
      volume24h: 198.7,
    },
  ];

  return (
    <div className="relative w-full py-12 md:py-16 px-4 md:px-8">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto mb-8 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-400/30">
          <Flame className="h-4 w-4 text-amber-400 animate-pulse" />
          <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Trending Now</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-white">Featured NFTs</h2>
          <p className="text-[hsl(var(--text-secondary))] max-w-2xl">
            Discover the most popular and active NFTs on the marketplace
          </p>
        </div>
      </div>

      {/* Featured Items Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredItems.map((item, index) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-2xl animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Premium Card Background */}
              <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 border border-white/10 backdrop-blur-xl transition-all duration-500 group-hover:border-cyan-400/50 group-hover:shadow-2xl group-hover:shadow-cyan-500/30 group-hover:-translate-y-2" />

              {/* Glow Effect */}
              <div className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-20 rounded-2xl blur-xl"
                style={{
                  background: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.25) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />

              {/* Hot Badge */}
              {item.isHot && (
                <div className="absolute top-4 right-4 z-20 animate-slide-in-down">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg backdrop-blur-xl bg-gradient-to-r from-red-500/90 to-orange-500/80 border border-red-300/60 shadow-lg shadow-red-500/40">
                    <Flame className="h-3.5 w-3.5 text-white animate-pulse" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Hot</span>
                  </div>
                </div>
              )}

              {/* Trending Badge */}
              <div className="absolute top-4 left-4 z-20 animate-slide-in-left">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg backdrop-blur-xl bg-gradient-to-r from-cyan-500/90 to-teal-500/80 border border-cyan-300/60 shadow-lg shadow-cyan-500/40">
                  <TrendingUp className="h-3.5 w-3.5 text-white" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Trending</span>
                </div>
              </div>

              {/* Image Container */}
              <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-white/8 to-white/[0.01] rounded-t-2xl">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  unoptimized
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Shine Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{
                    background: 'linear-gradient(135deg, transparent 30%, rgba(255, 255, 255, 0.15) 50%, transparent 70%)',
                    animation: 'shine 3s ease-in-out infinite',
                  }}
                />
              </div>

              {/* Content Section */}
              <div className="relative p-5 space-y-4 bg-gradient-to-b from-transparent to-black/20 rounded-b-2xl">
                {/* Title */}
                <div className="space-y-1">
                  <h3 className="text-lg font-bold font-display text-white line-clamp-2 group-hover:text-cyan-300 transition-colors">
                    {item.name}
                  </h3>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  {item.volume24h && (
                    <div className="relative p-2.5 rounded-lg bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-cyan-400/30 transition-all">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider">24h Vol</span>
                        <span className="text-sm font-bold text-cyan-300 font-mono">
                          {item.volume24h.toFixed(1)} SUI
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="relative p-2.5 rounded-lg bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-cyan-400/30 transition-all">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Floor</span>
                      <span className="text-sm font-bold text-amber-300 font-mono">
                        {item.price.toFixed(1)} SUI
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => onItemClick?.(item.id)}
                  className="w-full font-semibold bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white transition-all duration-300 rounded-lg"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  View Collection
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Background Glow */}
      <div className="absolute inset-0 -z-50 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{
            background: 'radial-gradient(ellipse, rgba(255, 165, 0, 0.3), transparent)',
          }}
        />
      </div>
    </div>
  );
}
