'use client';

import { ChevronDown, Menu } from 'lucide-react';
import { useState } from 'react';

export function LandingHero() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-lg">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="text-white font-display font-bold text-lg">GameNFT</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-slate-300 hover:text-white text-sm font-medium transition">
              ECOSYSTEM
            </a>
            <a href="#" className="text-slate-300 hover:text-white text-sm font-medium transition">
              Solutions
            </a>
            <a href="#" className="text-slate-300 hover:text-white text-sm font-medium transition">
              Developers
            </a>
            <a href="#" className="text-slate-300 hover:text-white text-sm font-medium transition">
              Learn
            </a>
            <a href="#" className="text-slate-300 hover:text-white text-sm font-medium transition">
              NFT Minting
            </a>
            <a href="#" className="text-slate-300 hover:text-white text-sm font-medium transition">
              Community
            </a>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden sm:block px-4 py-2 border border-slate-600 rounded-lg text-white text-sm font-medium hover:border-cyan-400/50 hover:bg-cyan-400/5 transition">
              LAUNCH APP
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-28 mx-auto max-w-7xl">
        {/* Grid Background Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1200 1200">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(99, 102, 241, 0.5)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Left Content */}
        <div className="relative z-10 flex flex-col justify-center">
          {/* Decorative Quote */}
          <div className="mb-8 flex items-center gap-3">
            <div className="border-l-2 border-cyan-400 pl-3">
              <p className="text-slate-400 text-sm leading-relaxed italic">
                "Unleash the power of blockchain gaming with next-gen NFT technology"
              </p>
            </div>
          </div>

          {/* Main Heading */}
          <div className="mb-8">
            <p className="text-slate-400 font-display font-medium text-sm tracking-widest mb-4">
              UNLOCK THE FUTURE OF
            </p>
            <h1 className="text-balance text-4xl sm:text-5xl lg:text-6xl font-display font-black leading-tight">
              <span className="block text-white">Web3</span>
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-cyan-400">
                  Gaming
                </span>
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-indigo-500" />
              </span>
            </h1>
          </div>

          {/* Description */}
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8 max-w-md">
            Your gateway to premium NFT gaming. Trade, mint, and collect game assets on the most secure blockchain ecosystem.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="px-8 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-display font-bold text-sm hover:shadow-lg hover:shadow-indigo-500/30 transition transform hover:-translate-y-0.5">
              START MINTING
            </button>
            <button className="px-8 py-3 rounded-lg border border-slate-600 text-white font-display font-bold text-sm hover:border-cyan-400 hover:bg-cyan-400/5 transition">
              EXPLORE MARKETPLACE
            </button>
          </div>

          {/* Features */}
          <div className="mt-12 pt-8 border-t border-slate-800 flex gap-8">
            <div>
              <p className="text-cyan-400 font-display font-bold text-lg">10M+</p>
              <p className="text-slate-400 text-sm">Assets Minted</p>
            </div>
            <div>
              <p className="text-cyan-400 font-display font-bold text-lg">50K+</p>
              <p className="text-slate-400 text-sm">Active Players</p>
            </div>
            <div>
              <p className="text-cyan-400 font-display font-bold text-lg">$100M+</p>
              <p className="text-slate-400 text-sm">Trading Volume</p>
            </div>
          </div>
        </div>

        {/* Right Content - AI Robot Placeholder */}
        <div className="relative z-10 flex items-center justify-center h-96 lg:h-full">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Glowing Background */}
            <div className="absolute inset-0 opacity-30 blur-3xl">
              <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-indigo-500 rounded-full" />
              <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-cyan-400 rounded-full" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-rose-500 rounded-full" />
            </div>

            {/* Robot Character - Placeholder */}
            <div className="relative w-64 h-64 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl flex items-center justify-center overflow-hidden border border-slate-700/50 backdrop-blur-xl group hover:border-cyan-400/30 transition">
              {/* Face/Screen area */}
              <div className="relative w-32 h-32 bg-gradient-to-br from-indigo-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/50">
                {/* Eyes simulation */}
                <div className="flex gap-6">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-8 right-8 w-4 h-4 border-2 border-cyan-400 rounded-full opacity-60" />
              <div className="absolute bottom-8 left-8 w-6 h-6 border-2 border-rose-400 rounded opacity-60" />
            </div>

            {/* Side Menu */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 text-right">
              <p className="text-slate-400 text-xs font-medium tracking-widest uppercase">Features</p>
              <a href="#" className="text-slate-300 hover:text-cyan-400 text-xs transition">
                Minting
              </a>
              <a href="#" className="text-slate-300 hover:text-cyan-400 text-xs transition">
                Trading
              </a>
              <a href="#" className="text-slate-300 hover:text-cyan-400 text-xs transition">
                Staking
              </a>
              <a href="#" className="text-slate-300 hover:text-cyan-400 text-xs transition">
                Rewards
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll Indicator */}
      <div className="flex justify-center items-center gap-2 pb-8 relative z-10">
        <span className="text-slate-400 text-xs font-medium tracking-widest uppercase">Scroll</span>
        <ChevronDown className="w-4 h-4 text-cyan-400 animate-bounce" />
      </div>
    </main>
  );
}
