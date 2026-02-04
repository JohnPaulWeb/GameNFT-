'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { ConnectButton } from '@mysten/dapp-kit';

import { SidebarTrigger } from '@/components/ui/sidebar';

const titleMap: Record<string, string> = {
  '/marketplace': 'Marketplace',
  '/my-nfts': 'My NFTs',
  '/mint': 'Mint New NFT',
  '/advisor': 'AI Advisor',
};

export function AppHeader() {
  const pathname = usePathname();
  const title = useMemo(() => titleMap[pathname] ?? 'SuiPlay', [pathname]);

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <h1 className="text-xl font-semibold md:text-2xl">{title}</h1>
      <div className="ml-auto">
        <ConnectButton />
      </div>
    </header>
  );
}
