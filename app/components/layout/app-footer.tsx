'use client';

import Link from 'next/link';
import { Github, Twitter, Mail, Zap } from 'lucide-react';

export function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/[0.06] bg-[hsl(var(--bg-void))]/98 backdrop-blur-xl mt-auto">
      {/* Gradient top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

      {/* Ambient glow background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        <div
          className="absolute bottom-20 left-1/3 w-96 h-48 blur-3xl rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(34, 211, 238, 0.12), transparent)',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400/40 to-cyan-500/20 border border-cyan-400/50 shadow-lg shadow-cyan-400/20">
                <span className="text-2xl font-bold text-cyan-300">◆</span>
              </div>
              <div>
                <span className="text-lg font-bold font-display text-white">SuiPlay</span>
                <p className="text-[10px] text-cyan-400/70 font-medium">Web3 Marketplace</p>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              Premium NFT marketplace powered by the Sui blockchain. Creating the future of digital ownership and web3 gaming.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white font-display tracking-[0.15em] uppercase">Navigation</h3>
            <nav className="flex flex-col gap-2.5">
              <Link href="/marketplace" className="text-sm text-white/60 hover:text-cyan-300 transition-colors duration-200 flex items-center gap-1.5 group">
                <span className="w-1 h-1 rounded-full bg-cyan-400/40 group-hover:bg-cyan-400 transition-colors" />
                Marketplace
              </Link>
              <Link href="/mint" className="text-sm text-white/60 hover:text-cyan-300 transition-colors duration-200 flex items-center gap-1.5 group">
                <span className="w-1 h-1 rounded-full bg-cyan-400/40 group-hover:bg-cyan-400 transition-colors" />
                Mint NFT
              </Link>
              <Link href="/my-nfts" className="text-sm text-white/60 hover:text-cyan-300 transition-colors duration-200 flex items-center gap-1.5 group">
                <span className="w-1 h-1 rounded-full bg-cyan-400/40 group-hover:bg-cyan-400 transition-colors" />
                My Collection
              </Link>
              <Link href="/advisor" className="text-sm text-white/60 hover:text-cyan-300 transition-colors duration-200 flex items-center gap-1.5 group">
                <span className="w-1 h-1 rounded-full bg-cyan-400/40 group-hover:bg-cyan-400 transition-colors" />
                AI Advisor
              </Link>
            </nav>
          </div>

          {/* ito yung mga links sa Resources */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white font-display tracking-[0.15em] uppercase">Resources</h3>
            <div className="flex flex-col gap-2.5">
              <a
                href="https://sui.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/60 hover:text-cyan-300 transition-colors duration-200 flex items-center gap-1.5 group"
              >
                <span className="w-1 h-1 rounded-full bg-cyan-400/40 group-hover:bg-cyan-400 transition-colors" />
                Sui Network
              </a>
              <a
                href="#"
                className="text-sm text-white/60 hover:text-cyan-300 transition-colors duration-200 flex items-center gap-1.5 group"
              >
                <span className="w-1 h-1 rounded-full bg-cyan-400/40 group-hover:bg-cyan-400 transition-colors" />
                Docs
              </a>
              <a
                href="#"
                className="text-sm text-white/60 hover:text-cyan-300 transition-colors duration-200 flex items-center gap-1.5 group"
              >
                <span className="w-1 h-1 rounded-full bg-cyan-400/40 group-hover:bg-cyan-400 transition-colors" />
                Support
              </a>
            </div>
          </div>

          {/* Connect Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white font-display tracking-[0.15em] uppercase">Community</h3>
            <div className="flex gap-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400/60 hover:bg-cyan-400/10 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/20 group"
                title="GitHub"
              >
                <Github className="h-4 w-4 text-white/60 group-hover:text-cyan-300 transition-colors" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400/60 hover:bg-cyan-400/10 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/20 group"
                title="Twitter"
              >
                <Twitter className="h-4 w-4 text-white/60 group-hover:text-cyan-300 transition-colors" />
              </a>
              <a
                href="mailto:hello@suiplay.io"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400/60 hover:bg-cyan-400/10 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/20 group"
                title="Email"
              >
                <Mail className="h-4 w-4 text-white/60 group-hover:text-cyan-300 transition-colors" />
              </a>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs text-cyan-400/70 bg-cyan-400/5 border border-cyan-400/15 rounded-lg px-3 py-1.5 mt-2">
              <Zap className="h-3 w-3" />
              <span>Powered by Sui</span>
            </div>
          </div>
        </div>

        {/* ito yung Divider */}
        <div className="border-t border-white/[0.06] mb-8" />

        {/* ito yung Bottom info bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-xs text-white/40 font-medium">
            © {currentYear} SuiPlay Marketplace. All rights reserved.
          </p>
          <div className="flex gap-6 sm:gap-8">
            <a href="#" className="text-xs text-white/40 hover:text-cyan-300 transition-colors duration-200">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-white/40 hover:text-cyan-300 transition-colors duration-200">
              Terms of Service
            </a>
            <a href="#" className="text-xs text-white/40 hover:text-cyan-300 transition-colors duration-200">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
