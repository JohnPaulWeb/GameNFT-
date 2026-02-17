'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { ConnectButton } from '@mysten/dapp-kit';

import { SidebarTrigger } from '@/app/components/ui/sidebar';

const titleMap: Record<string, string> = {
  '/marketplace': 'Marketplace',
  '/my-nfts': 'My Collection',
  '/mint': 'Mint New Item',
  '/advisor': 'AI Advisor',
};

export function AppHeader() {
  const pathname = usePathname();
  const title = useMemo(() => titleMap[pathname] ?? 'SuiPlay', [pathname]);

  return (
    <header className="sticky top-0 z-40 flex h-16 md:h-20 shrink-0 items-center gap-4 border-b border-white/10 bg-gradient-to-r from-[hsl(var(--bg-primary))]/80 to-[hsl(var(--bg-primary))]/60 backdrop-blur-xl px-4 md:px-8">
      {/* Ambient top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
      
      <SidebarTrigger className="-ml-2 text-white/70 hover:text-cyan-300 transition-colors" />
      
      {/* Logo/Title Section */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400/20 to-cyan-400/5 border border-cyan-400/30 flex items-center justify-center font-display font-bold text-cyan-300 text-lg">
          ◆
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl font-bold font-display text-white leading-none tracking-tight">
            SuiPlay
          </h1>
          <p className="text-xs text-[hsl(var(--text-secondary))] font-medium">Premium NFT Marketplace</p>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden sm:block flex-grow max-w-sm">
        <div className="h-px bg-gradient-to-r from-cyan-400/20 to-transparent" />
      </div>

      {/* Page Title - Hidden on Mobile */}
      <div className="hidden md:flex flex-1 items-center justify-center">
        <h2 className="text-lg font-semibold font-display text-[hsl(var(--text-primary))] tracking-tight">
          {title}
        </h2>
      </div>

      {/* Mobile Title */}
      <div className="md:hidden flex-1">
        <h2 className="text-base font-semibold font-display text-[hsl(var(--text-primary))]">
          {title}
        </h2>
      </div>
      
      {/* Connect Button */}
      <div className="ml-auto">
        <ConnectButton />
      </div>
    </header>
  );
}
