'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { ConnectButton } from '@mysten/dapp-kit';
import { LayoutGrid, Gem, PlusCircle, Bot } from 'lucide-react';

import { SidebarTrigger } from '@/app/components/ui/sidebar';

const titleMap: Record<string, string> = {
  '/marketplace': 'Marketplace',
  '/my-nfts': 'My Collection',
  '/mint': 'Mint New Item',
  '/advisor': 'AI Advisor',
};

const iconMap: Record<string, React.ElementType> = {
  '/marketplace': LayoutGrid,
  '/my-nfts': Gem,
  '/mint': PlusCircle,
  '/advisor': Bot,
};

export function AppHeader() {
  const pathname = usePathname();
  const title = useMemo(() => titleMap[pathname] ?? 'SuiPlay', [pathname]);
  const PageIcon = useMemo(() => iconMap[pathname] ?? null, [pathname]);

  return (
    <header className="sticky top-0 z-40 flex h-16 md:h-[72px] shrink-0 items-center gap-3 md:gap-6 border-b border-white/[0.08] bg-gradient-to-r from-[hsl(var(--bg-void))]/95 via-[hsl(var(--bg-primary))]/90 to-cyan-500/[0.03] backdrop-blur-2xl px-3 md:px-6 lg:px-8 overflow-hidden shadow-2xl shadow-black/20">
      {/* Premium gradient line - enhanced */}
      <div className="absolute inset-x-0 bottom-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />

      {/* Enhanced ambient glow effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent blur-sm" />
        <div
          className="absolute -top-8 left-1/4 w-80 h-40 opacity-[0.15] blur-[60px]"
          style={{
            background: 'radial-gradient(ellipse, rgba(16, 240, 252, 0.5), rgba(99, 102, 241, 0.3), transparent)',
          }}
        />
        <div
          className="absolute -top-8 right-1/4 w-72 h-36 opacity-[0.12] blur-[60px]"
          style={{
            background: 'radial-gradient(ellipse, rgba(139, 92, 246, 0.4), transparent)',
          }}
        />
      </div>

      <SidebarTrigger className="-ml-1 md:-ml-2 text-white/60 hover:text-cyan-300 hover:bg-cyan-400/15 rounded-lg transition-all duration-300 relative z-10 p-2 hover:scale-105 active:scale-95" />

      {/* Logo/Title Section - Mobile only */}
      <div className="flex md:hidden items-center gap-2 relative z-10">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400/40 to-indigo-500/30 border border-cyan-400/40 flex items-center justify-center font-display font-bold text-cyan-300 shadow-lg shadow-cyan-400/25 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-400/35 hover:scale-105">
          ◆
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm font-bold font-display text-white leading-none tracking-tight">
            SuiPlay
          </h1>
        </div>
      </div>

      {/* Page Title - Enhanced design */}
      <div className="flex-1 flex items-center justify-center relative z-10 min-w-0">
        <div className="inline-flex items-center gap-2 md:gap-3 px-3 md:px-6 py-2 md:py-2.5 rounded-xl bg-gradient-to-br from-white/[0.09] via-white/[0.06] to-white/[0.03] border border-white/[0.12] backdrop-blur-xl shadow-xl shadow-black/10 transition-all duration-300 hover:border-cyan-400/30 hover:shadow-2xl hover:shadow-cyan-500/10 hover:scale-[1.02] group relative overflow-hidden">
          {/* Shine effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
          </div>
          
          {PageIcon && (
            <div className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400/25 to-indigo-500/15 border border-cyan-400/25 shadow-inner transition-all duration-300 group-hover:from-cyan-400/35 group-hover:to-indigo-500/25 group-hover:shadow-lg group-hover:shadow-cyan-400/20">
              <PageIcon className="h-3 w-3 md:h-4 md:w-4 text-cyan-300 transition-transform duration-300 group-hover:scale-110" />
            </div>
          )}
          <h2 className="text-xs md:text-base lg:text-lg font-bold font-display text-white tracking-tight truncate relative">
            {title}
          </h2>
        </div>
      </div>

      {/* Connect Button - Enhanced wrapper */}
      <div className="ml-auto relative z-10">
        <div className="rounded-xl p-[1px] bg-gradient-to-br from-cyan-500/40 via-indigo-500/30 to-purple-500/20 shadow-xl shadow-cyan-500/20 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/30 hover:scale-105 active:scale-95">
          <div className="rounded-[11px] bg-[hsl(var(--bg-primary))]/80 backdrop-blur-sm">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}

