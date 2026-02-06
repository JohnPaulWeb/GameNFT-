'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { ConnectButton } from '@mysten/dapp-kit';

import { SidebarTrigger } from '@/app/components/ui/sidebar';

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
    <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-background px-4 sm:h-16 sm:px-6">
      <SidebarTrigger className="-ml-2 md:hidden" />
      <h1 className="text-xl font-semibold md:text-2xl">{title}</h1>
      <div className="ml-auto">
        <ConnectButton />
      </div>
    </header>
  );
}
