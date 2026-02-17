'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, Gem, LayoutGrid, LogOut, PlusCircle, Wallet } from 'lucide-react';
import { useCurrentAccount, useDisconnectWallet, useSuiClient } from '@mysten/dapp-kit';
import { useQuery } from '@tanstack/react-query';

import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/app/components/ui/sidebar';
import { Logo } from '@/app/components/icons';
import { Skeleton } from '../ui/skeleton';

const menuItems = [
  {
    href: '/marketplace',
    icon: LayoutGrid,
    label: 'Marketplace',
  },
  {
    href: '/my-nfts',
    icon: Gem,
    label: 'My NFTs',
  },
  {
    href: '/mint',
    icon: PlusCircle,
    label: 'Mint NFT',
  },
  {
    href: '/advisor',
    icon: Bot,
    label: 'AI Advisor',
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: disconnect } = useDisconnectWallet();

  const { data: coinBalance, isPending: isLoading } = useQuery({
    queryKey: ['coinBalance', account?.address],
    queryFn: () => {
      if (!account?.address) return null;
      return suiClient.getBalance({ owner: account.address });
    },
    enabled: !!account?.address,
    refetchInterval: 5000, // Refetch every 5 seconds
  });


  const UserProfile = () => {
    if (!account) {
      return (
        <div className="flex items-center gap-3 p-3">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="flex w-full flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
      );
    }

    const balanceInSui = coinBalance ? (Number(coinBalance.totalBalance) / 1_000_000_000).toFixed(2) : '0.00';

    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300">
        <Avatar className="h-11 w-11">
          <AvatarImage
            src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${account.address}`}
            alt="User Avatar"
            data-ai-hint="user avatar"
          />
          <AvatarFallback className="bg-cyan-400/20 text-cyan-300">{account.address.slice(2, 4).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col overflow-hidden flex-1">
          <span className="font-semibold truncate text-sm text-white">
            {account.label || `${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-secondary))]">
            <Wallet className="size-3 text-cyan-300" />
            <span>
                {isLoading && 'Loading...'}
                {!isLoading && `${balanceInSui} SUI`}
            </span>
          </div>
        </div>
        <Button variant="ghost-premium" size="icon" className="ml-auto h-9 w-9" onClick={() => disconnect()}>
          <LogOut className="size-4" />
        </Button>
      </div>
    )
  }

  return (
    <Sidebar collapsible="none" className="border-r border-white/10 bg-gradient-to-b from-[hsl(var(--bg-primary))] to-[hsl(var(--bg-secondary))]">
      <SidebarHeader className="border-b border-white/10">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400/20 to-cyan-400/5 border border-cyan-400/30">
            <span className="text-xl font-bold text-cyan-300">◆</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold font-display text-white leading-tight">SuiPlay</span>
            <span className="text-xs text-cyan-300 font-semibold">NFT Marketplace</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-0 px-0">
        <SidebarMenu className="gap-1 px-2 py-2">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
                className={cn(
                  "relative rounded-lg transition-all duration-300 font-medium text-[hsl(var(--text-secondary))] hover:text-white",
                  pathname === item.href && "bg-gradient-to-r from-cyan-500/20 to-cyan-500/10 border border-cyan-400/40 text-cyan-300 hover:text-cyan-200"
                )}
              >
                <Link href={item.href} className="flex items-center gap-3 px-4 py-3 w-full">
                  <item.icon className={cn(
                    "h-5 w-5 transition-colors",
                    pathname === item.href && "text-cyan-300"
                  )} />
                  <span className="flex-1">{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-white/10">
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  );
}
