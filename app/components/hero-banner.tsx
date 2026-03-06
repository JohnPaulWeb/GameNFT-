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
    <div className="relative w-full h-auto min-h-[500px] md:min-h-[600px] overflow-hidden rounded-3xl">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c0e18] via-[#1a1f3a] to-[#0a0c14]" />

        {/* Animated Gradient Orbs */}
        <div 
          className="absolute top-0 right-1/4 w-96 h-96 rounded-full opacity-30 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(16, 240, 252, 0.4), transparent)',
            animation: 'aurora 20s ease-in-out infinite',
          }}
        />
        
        {/* ito naman yung div */}
        <div 
          className="absolute -bottom-32 left-1/3 w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3), transparent)',
            animation: 'glow-pulse 15s ease-in-out infinite',
            animationDelay: '3s',
          }}
        />

        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 240, 255, 0.1) 25%, rgba(0, 240, 252, 0.1) 26%, transparent 27%, transparent 74%, rgba(0, 240, 255, 0.1) 75%, rgba(0, 240, 252, 0.1) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 240, 255, 0.1) 25%, rgba(0, 240, 252, 0.1) 26%, transparent 27%, transparent 74%, rgba(0, 240, 255, 0.1) 75%, rgba(0, 240, 252, 0.1) 76%, transparent 77%, transparent)',
            backgroundSize: '50px 50px',
            animation: 'drift 20s linear infinite',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative h-full min-h-[500px] md:min-h-[600px] flex flex-col justify-between p-8 md:p-12">
        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center max-w-2xl space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 w-fit px-3 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/30 animate-fade-up">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-sm font-semibold text-cyan-300 uppercase tracking-wider">Premium NFT Marketplace</span>
          </div>

          {/* ito naman yung Main Head */}
          <div className="space-y-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-5xl md:text-7xl font-bold font-display leading-tight tracking-tight text-white">
              <span className="block mb-2 text-2xl md:text-3xl font-normal text-[hsl(var(--text-secondary))]">
                Welcome to
              </span>
              <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-indigo-500 bg-clip-text text-transparent">
                SuiPlay NFT
              </span>
            </h1>
          </div>

          {/* ito naman yung Description */}
          <p className="text-lg md:text-xl text-[hsl(var(--text-secondary))] max-w-xl leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Experience the future of digital collectibles. Trade rare NFTs, discover exclusive items, and join the most vibrant Web3 community powered by Sui blockchain.
          </p>

          {/* ito naman yung CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Button
              onClick={onExplore}
              className="group bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-semibold text-base px-8 py-6 rounded-xl shadow-xl shadow-cyan-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/50 hover:-translate-y-1"
            >
              {/* ito naman yung icon  */}
              <Sparkles className="h-5 w-5 mr-2" />
              Explore Marketplace
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            {/* ito naman yung button */}
            <Button
              variant="outline"
              className="border-white/20 hover:border-cyan-400/50 text-white hover:text-cyan-300 font-semibold text-base px-8 py-6 rounded-xl hover:bg-cyan-400/10 transition-all duration-300"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* ito naman yung stats bar botoom*/}
        <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10 animate-fade-up" style={{ animationDelay: '0.4s' }}>
          {defaultStats.map((stat, index) => (
            <div key={index} className="group relative flex flex-col gap-1 p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/2 border border-white/10 hover:border-cyan-400/50 hover:bg-gradient-to-br hover:from-white/8 hover:to-white/3 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
              <span className="text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider">
                {stat.label}
              </span>
              <span className="text-lg md:text-2xl font-bold font-display text-white">
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ito naman yung Decorative Elements */}
      <div className="absolute top-8 left-8 w-20 h-20 rounded-full border border-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute bottom-8 right-8 w-16 h-16 rounded-full border border-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
}
