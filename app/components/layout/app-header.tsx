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
    <header className="sticky top-0 z-40 flex h-16 md:h-20 shrink-0 items-center gap-4 border-b border-white/10 bg-[hsl(var(--bg-void))]/95 backdrop-blur-xl px-4 md:px-8 relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
        <div 
          className="absolute top-0 left-1/4 w-64 h-32 opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(ellipse, rgba(16, 240, 252, 0.4), transparent)',
          }}
        />
      </div>
      
      <SidebarTrigger className="-ml-2 text-white/70 hover:text-cyan-300 hover:bg-cyan-400/10 rounded-lg transition-all duration-200 relative z-10" />
      
      {/* Logo/Title Section - Mobile only */}
      <div className="flex md:hidden items-center gap-2.5 relative z-10">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400/30 to-cyan-500/10 border border-cyan-400/40 flex items-center justify-center font-display font-bold text-cyan-300 shadow-lg shadow-cyan-400/20">
          ◆
        </div>
        <div className="flex flex-col">
          <h1 className="text-base font-bold font-display text-white leading-none tracking-tight">
            SuiPlay
          </h1>
        </div>
      </div>

      {/* Page Title */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
          <h2 className="text-sm md:text-lg font-bold font-display text-white tracking-tight">
            {title}
          </h2>
        </div>
      </div>
      
      {/* Connect Button */}
      <div className="ml-auto relative z-10">
        <div className="rounded-lg p-0.5 bg-gradient-to-r from-cyan-400/20 to-cyan-500/20">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
