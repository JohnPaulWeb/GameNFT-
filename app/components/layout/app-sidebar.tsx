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


// ito yung app-sidebaar 
// not only fix
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


// ito naman yung path
export function AppSidebar() {
  const pathname = usePathname();
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: disconnect } = useDisconnectWallet();

  // ito naman yung query for coin balance
  const { data: coinBalance, isPending: isLoading } = useQuery({
    queryKey: ['coinBalance', account?.address],
    queryFn: () => {
      if (!account?.address) return null;
      return suiClient.getBalance({ owner: account.address });
    },
    enabled: !!account?.address,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  
  // User profile section
  const UserProfile = () => {
    if (!account) {
      return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-default))]">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex w-full flex-col gap-1.5">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      );
    }

    const balanceInSui = coinBalance ? (Number(coinBalance.totalBalance) / 1_000_000_000).toFixed(2) : '0.00';

    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border border-[hsl(var(--border-default))] bg-[hsl(var(--bg-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors duration-200 group">
        <div className="relative shrink-0">
          <Avatar className="h-9 w-9 border border-[hsl(var(--accent-indigo)_/_0.3)]">
            <AvatarImage
              src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${account.address}`}
              alt="User Avatar"
              data-ai-hint="user avatar"
            />
            <AvatarFallback className="bg-[hsl(var(--accent-indigo)_/_0.1)] text-[hsl(var(--accent-indigo))] font-medium text-xs">{account.address.slice(2, 4).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[hsl(var(--accent-emerald))] border-2 border-[hsl(var(--bg-primary))]" />
        </div>
        <div className="flex flex-col overflow-hidden flex-1 min-w-0">
          <span className="font-medium truncate text-xs text-white">
            {account.label || `${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
          </span>
          <div className="flex items-center gap-1 text-xs text-[hsl(var(--text-secondary))]">
            <Wallet className="size-3 text-[hsl(var(--accent-indigo))]" />
            {isLoading ? (
              <span className="text-[hsl(var(--text-muted))]">...</span>
            ) : (
              <><span className="text-[hsl(var(--accent-cyan))]">{balanceInSui}</span><span className="ml-0.5">SUI</span></>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto h-7 w-7 hover:bg-red-500/15 hover:text-red-400 transition-colors rounded-lg shrink-0"
          onClick={() => disconnect()}
          title="Disconnect Wallet"
        >
          <LogOut className="size-3.5" />
        </Button>
      </div>
    )
  }
// dito magsisimula yung code mo 
  return (
    <Sidebar collapsible="none" className="border-r border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-primary))]">
      <SidebarHeader className="border-b border-[hsl(var(--border-subtle))] p-0">
        <div className="flex items-center gap-3 px-4 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--accent-indigo)_/_0.1)] border border-[hsl(var(--accent-indigo)_/_0.25)]">
            <span className="text-base font-semibold text-[hsl(var(--accent-indigo))]">◆</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold font-display text-white leading-tight tracking-tight">SuiPlay</span>
            <span className="text-[10px] text-[hsl(var(--text-muted))] font-medium tracking-wider uppercase">Marketplace</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0 px-0">
        <SidebarMenu className="gap-1 px-3 py-4">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
                className={cn(
                  "rounded-lg transition-colors duration-150 font-medium text-[hsl(var(--text-secondary))] hover:text-white hover:bg-[hsl(var(--bg-secondary))]",
                  pathname === item.href && "bg-[hsl(var(--accent-indigo)_/_0.1)] border border-[hsl(var(--accent-indigo)_/_0.25)] text-[hsl(var(--accent-indigo))] hover:text-[hsl(var(--accent-indigo))] hover:bg-[hsl(var(--accent-indigo)_/_0.15)]"
                )}
              >
                <Link href={item.href} className="flex items-center gap-3 px-3 py-2.5 w-full">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-150",
                    pathname === item.href
                      ? "bg-[hsl(var(--accent-indigo)_/_0.15)] border border-[hsl(var(--accent-indigo)_/_0.3)]"
                      : "bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-default))]"
                  )}>
                    <item.icon className={cn(
                      "h-4 w-4",
                      pathname === item.href ? "text-[hsl(var(--accent-indigo))]" : "text-[hsl(var(--text-secondary))]"
                    )} />
                  </div>
                  <span className="flex-1 text-sm font-medium">{item.label}</span>
                  {pathname === item.href && (
                    <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent-indigo))]" />
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-[hsl(var(--border-subtle))] p-3">
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  );
}
