'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface HeroBannerProps {
  onExplore?: () => void;
  stats?: {
    label: string;
    value: string | number;
  }[];
}

export function HeroBanner({ onExplore, stats }: HeroBannerProps) {
  const defaultStats = stats || [
    { label: 'NFTs Listed', value: '1,200+' },
    { label: 'Active Users', value: '5,000+' },
    { label: 'Total Volume', value: '250K SUI' },
  ];

  return (
    <div className="relative w-full h-auto min-h-[450px] md:min-h-[550px] overflow-hidden rounded-2xl">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        {/* Refined Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D0D0D] via-[#141414] to-[#0A0A0A]" />

        {/* Subtle Animated Orbs */}
        <div 
          className="absolute top-0 right-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(74, 123, 167, 0.3), transparent)',
            animation: 'aurora 25s ease-in-out infinite',
          }}
        />
        
        <div 
          className="absolute -bottom-32 left-1/3 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(212, 163, 115, 0.25), transparent)',
            animation: 'glow-pulse 20s ease-in-out infinite',
            animationDelay: '3s',
          }}
        />

        {/* Minimal Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(212, 163, 115, 0.08) 25%, rgba(212, 163, 115, 0.08) 26%, transparent 27%, transparent 74%, rgba(212, 163, 115, 0.08) 75%, rgba(212, 163, 115, 0.08) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(212, 163, 115, 0.08) 25%, rgba(212, 163, 115, 0.08) 26%, transparent 27%, transparent 74%, rgba(212, 163, 115, 0.08) 75%, rgba(212, 163, 115, 0.08) 76%, transparent 77%, transparent)',
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative h-full min-h-[450px] md:min-h-[550px] flex flex-col justify-between p-8 md:p-12">
        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center max-w-3xl space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 w-fit px-3 py-1.5 rounded-full bg-[hsl(var(--accent-indigo)_/_0.08)] border border-[hsl(var(--accent-indigo)_/_0.25)] animate-fade-up">
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--accent-indigo))] animate-pulse" />
            <span className="text-xs font-medium text-[hsl(var(--accent-indigo))] uppercase tracking-wider">Premium NFT Marketplace</span>
          </div>

          {/* Main Heading */}
          <div className="space-y-3 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-5xl md:text-6xl font-medium font-display leading-tight tracking-tight text-white">
              <span className="block mb-2 text-lg font-normal text-[hsl(var(--text-secondary))]">
                Welcome to
              </span>
              <span className="text-gradient-brand">
                SuiPlay NFT
              </span>
            </h1>
          </div>

          {/* Description */}
          <p className="text-base md:text-lg text-[hsl(var(--text-secondary))] max-w-2xl leading-relaxed animate-fade-up font-light" style={{ animationDelay: '0.2s' }}>
            Trade curated digital collectibles on the Sui blockchain. Experience seamless transactions, transparent pricing, and a thriving community of collectors and creators.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 animate-fade-up pt-2" style={{ animationDelay: '0.3s' }}>
            <Button
              onClick={onExplore}
              className="group btn-primary"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Explore Marketplace
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
            </Button>
            <Button
              variant="outline"
              className="btn-outline"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 pt-8 border-t border-[hsl(var(--border-default))] animate-fade-up" style={{ animationDelay: '0.4s' }}>
          {defaultStats.map((stat, index) => (
            <div key={index} className="group relative flex flex-col gap-1 p-4 rounded-lg bg-gradient-to-br from-[hsl(var(--bg-secondary)_/_0.6)] to-[hsl(var(--bg-tertiary)_/_0.4)] border border-[hsl(var(--border-subtle))] hover:border-[hsl(var(--accent-indigo)_/_0.3)] transition-all duration-300 hover:bg-gradient-to-br hover:from-[hsl(var(--bg-secondary)_/_0.8)] hover:to-[hsl(var(--bg-tertiary)_/_0.6)]">
              <span className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase tracking-wider">
                {stat.label}
              </span>
              <span className="text-lg md:text-2xl font-semibold font-display text-white">
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
