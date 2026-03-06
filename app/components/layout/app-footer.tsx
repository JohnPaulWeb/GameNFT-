'use client';

import Link from 'next/link';
import { Github, Twitter, Mail, ExternalLink } from 'lucide-react';

export function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/10 bg-[hsl(var(--bg-void))]/95 backdrop-blur-xl mt-auto">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
      
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div 
          className="absolute bottom-0 left-1/4 w-96 h-32 blur-3xl"
          style={{
            background: 'radial-gradient(ellipse, rgba(16, 240, 252, 0.2), transparent)',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400/30 to-cyan-500/10 border border-cyan-400/40 shadow-lg shadow-cyan-400/20">
                <span className="text-xl font-bold text-cyan-300">◆</span>
              </div>
              <span className="text-xl font-bold font-display text-white">SuiPlay</span>
            </div>
            {/* ito naman yung text sa footer */}
            <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed max-w-xs">
              Premium NFT marketplace powered by Sui blockchain. Creating the future of digital ownership.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white font-display tracking-wide">QUICK LINKS</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/marketplace" className="text-sm text-[hsl(var(--text-secondary))] hover:text-cyan-300 transition-colors">
                Marketplace
              </Link>
              <Link href="/mint" className="text-sm text-[hsl(var(--text-secondary))] hover:text-cyan-300 transition-colors">
                Mint NFT
              </Link>
              <Link href="/my-nfts" className="text-sm text-[hsl(var(--text-secondary))] hover:text-cyan-300 transition-colors">
                My Collection
              </Link>
              <Link href="/advisor" className="text-sm text-[hsl(var(--text-secondary))] hover:text-cyan-300 transition-colors">
                AI Advisor
              </Link>
            </nav>
          </div>

          {/* ito naman yung mga Links sa footers  */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white font-display tracking-wide">CONNECT</h3>
            <div className="flex gap-3">

              {/* Links sa github */}
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400/50 hover:bg-cyan-400/10 transition-all duration-300 group"
              >
                <Github className="h-5 w-5 text-white/70 group-hover:text-cyan-300 transition-colors" />
              </a>
              <a 

              // Link sa twitter
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400/50 hover:bg-cyan-400/10 transition-all duration-300 group"
              >
                <Twitter className="h-5 w-5 text-white/70 group-hover:text-cyan-300 transition-colors" />
              </a>
              <a
                href="mailto:hello@suiplay.io"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400/50 hover:bg-cyan-400/10 transition-all duration-300 group"
              >
                <Mail className="h-5 w-5 text-white/70 group-hover:text-cyan-300 transition-colors" />
              </a>
            </div>
            <a 

            // Link for SUI
              href="https://sui.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[hsl(var(--text-secondary))] hover:text-cyan-300 transition-colors group"
            >
              Powered by Sui
              <ExternalLink className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* ito naman yung Bottom Bar  */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[hsl(var(--text-muted))]">
            © {currentYear} SuiPlay. All rights reserved.
          </p>
          {/* ito naman yung Privacy Policy  */}
          <div className="flex gap-6">
            <a href="#" className="text-xs text-[hsl(var(--text-muted))] hover:text-cyan-300 transition-colors">
              Privacy Policy
            </a>
            {/* ito naman yung  Terms of Services */}
            <a href="#" className="text-xs text-[hsl(var(--text-muted))] hover:text-cyan-300 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
