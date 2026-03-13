'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { ConnectButton } from '@mysten/dapp-kit';
import { LayoutGrid, Gem, PlusCircle, Bot } from 'lucide-react';

import { SidebarTrigger } from '@/app/components/ui/sidebar';

const titleMap: Record<string, string> = {
  '/marketplace': 'Marketplace',
  '/my-nfts': 'My Collection',
  '/mint': 'Mint NFT',
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
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[hsl(var(--bg-void))]/95 backdrop-blur-xl px-4 md:px-6 lg:px-8">
      {/* Gradient border accent */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

      {/* Left section */}
      <div className="flex items-center gap-3 md:gap-4">
        <SidebarTrigger className="text-white/50 hover:text-white hover:bg-white/[0.08] rounded-lg transition-all p-2 border border-transparent hover:border-white/[0.1]" />

        {/* Mobile logo */}
        <div className="md:hidden flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400/40 to-indigo-500/30 border border-cyan-400/40 flex items-center justify-center text-cyan-300 text-sm font-bold">◆</div>
          <span className="text-sm font-bold font-display text-white tracking-tight">SuiPlay</span>
        </div>
      </div>

      {/* Center section - Page indicator */}
      <div className="hidden md:flex items-center justify-center flex-1">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm hover:border-white/[0.15] hover:bg-white/[0.06] transition-all duration-200">
          {PageIcon && <PageIcon className="h-4 w-4 text-cyan-300/90" />}
          <span className="text-sm font-semibold font-display text-white/95 tracking-tight">{title}</span>
        </div>
      </div>

      {/* Right section - Connect button */}
      <div className="ml-auto">
        <div className="[&_button]:rounded-xl [&_button]:bg-gradient-to-r [&_button]:from-cyan-500 [&_button]:to-cyan-400 [&_button]:text-[hsl(var(--bg-void))] [&_button]:font-bold [&_button]:text-sm [&_button]:px-5 [&_button]:py-2.5 [&_button]:border-0 [&_button]:hover:from-cyan-400 [&_button]:hover:to-cyan-300 [&_button]:transition-all [&_button]:duration-200 [&_button]:shadow-[0_0_20px_rgba(34,211,238,0.25)] [&_button]:hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}

