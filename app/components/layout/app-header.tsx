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
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-4 border-b border-white/[0.07] bg-[hsl(var(--bg-void))]/95 backdrop-blur-xl px-4 md:px-6 lg:px-8">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent" />

      <SidebarTrigger className="text-white/50 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors p-2" />

      <div className="flex md:hidden items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400/30 to-indigo-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 text-sm font-bold">◆</div>
        <span className="text-sm font-bold font-display text-white">SuiPlay</span>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.09] bg-white/[0.04]">
          {PageIcon && <PageIcon className="h-3.5 w-3.5 text-cyan-300/80" />}
          <span className="text-sm font-semibold font-display text-white/90 tracking-tight">{title}</span>
        </div>
      </div>

      <div className="ml-auto">
        <div className="rounded-xl p-[1px] bg-gradient-to-br from-cyan-500/35 via-indigo-500/25 to-purple-500/15">
          <div className="rounded-[11px] bg-[hsl(var(--bg-void))]/90 backdrop-blur-sm">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}

