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
    <header className="sticky top-0 z-40 flex h-16 md:h-20 shrink-0 items-center gap-4 border-b border-white/10 bg-gradient-to-r from-[hsl(var(--bg-void))] via-[hsl(var(--bg-void))] to-cyan-500/5 backdrop-blur-2xl px-4 md:px-8 relative overflow-hidden shadow-lg shadow-cyan-500/5">
      {/* Premium gradient line */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

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

      <SidebarTrigger className="-ml-2 text-white/70 hover:text-cyan-300 hover:bg-cyan-400/20 rounded-lg transition-all duration-200 relative z-10 p-2" />

      {/* Logo/Title Section - Mobile only */}
      <div className="flex md:hidden items-center gap-2.5 relative z-10">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400/40 to-cyan-500/20 border border-cyan-400/50 flex items-center justify-center font-display font-bold text-cyan-300 shadow-lg shadow-cyan-400/30 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-400/40">
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
        <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-white/8 to-white/3 border border-white/15 backdrop-blur-md shadow-lg shadow-cyan-500/10 transition-all duration-300 hover:border-cyan-400/40 hover:bg-gradient-to-r hover:from-white/12 hover:to-white/5">
          {PageIcon && (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400/30 to-cyan-500/10 border border-cyan-400/30">
              <PageIcon className="h-4 w-4 text-cyan-300" />
            </div>
          )}
          <h2 className="text-sm md:text-lg font-bold font-display text-white tracking-tight">
            {title}
          </h2>
        </div>
      </div>

      {/* Connect Button */}
      <div className="ml-auto relative z-10">
        <div className="rounded-xl p-1 bg-gradient-to-r from-cyan-500/30 to-indigo-500/20 shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/30">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}

