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
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-primary))]/95 backdrop-blur-sm px-6 md:px-8">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <SidebarTrigger className="text-[hsl(var(--text-secondary))] hover:text-white hover:bg-[hsl(var(--bg-elevated))] rounded-lg transition-colors p-2 -ml-2" />
        
        <div className="hidden md:flex items-center gap-2.5 px-3 py-2 rounded-lg border border-[hsl(var(--border-default))] bg-[hsl(var(--bg-secondary))]">
          {PageIcon && <PageIcon className="h-4 w-4 text-[hsl(var(--accent-indigo))]" />}
          <span className="text-sm font-medium text-white">{title}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ConnectButton />
      </div>
    </header>
  );
}

