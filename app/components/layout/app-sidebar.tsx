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

  
  // ito naman yung user profile
  const UserProfile = () => {
    if (!account) {
      return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
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
      <div className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] transition-colors duration-200 group">
        <div className="relative shrink-0">
          <Avatar className="h-9 w-9 border border-cyan-400/30">
            <AvatarImage
              src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${account.address}`}
              alt="User Avatar"
              data-ai-hint="user avatar"
            />
            <AvatarFallback className="bg-cyan-400/10 text-cyan-300 font-bold text-xs">{account.address.slice(2, 4).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-[hsl(var(--bg-void))]" />
        </div>
        <div className="flex flex-col overflow-hidden flex-1 min-w-0">
          <span className="font-semibold truncate text-xs text-white/90">
            {account.label || `${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
          </span>
          <div className="flex items-center gap-1 text-xs text-white/50">
            <Wallet className="size-3 text-cyan-400/70" />
            {isLoading ? (
              <span className="text-white/40">...</span>
            ) : (
              <><span className="text-cyan-300/90">{balanceInSui}</span><span className="ml-0.5">SUI</span></>
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
    <Sidebar collapsible="none" className="border-r border-white/[0.08] bg-[hsl(var(--bg-void))]">
      {/* ito naman yung sidebarHeader */}
      <SidebarHeader className="relative border-b border-white/[0.07] p-0">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/25">
            <span className="text-base font-bold text-cyan-300">◆</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold font-display text-white leading-tight tracking-tight">SuiPlay</span>
            <span className="text-[10px] text-white/40 font-medium tracking-wider uppercase">NFT Marketplace</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
      </SidebarHeader>

      {/* ito naman yung sidebarcontent */}
      <SidebarContent className="gap-0 px-0">
        <SidebarMenu className="gap-1 px-3 py-4">
          {menuItems.map((item) => (
            // ito yung SideBar Menu
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
                className={cn(
                  "h-auto rounded-lg transition-colors duration-150 font-medium text-white/50 hover:text-white hover:bg-white/[0.07] overflow-hidden",
                  pathname === item.href && "rounded-l-none border-l-2 border-cyan-400 bg-cyan-400/[0.08] text-cyan-200 hover:text-cyan-100 hover:bg-cyan-400/[0.12]"
                )}
              >
                <Link href={item.href} className={cn(
                  "flex items-center gap-3 py-2.5 w-full",
                  pathname === item.href ? "pl-3 pr-3" : "px-3"
                )}>
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors duration-150",
                    pathname === item.href
                      ? "bg-cyan-400/15 border border-cyan-400/25"
                      : "bg-white/[0.05] border border-white/[0.07]"
                  )}>
                    <item.icon className={cn(
                      "h-4 w-4",
                      pathname === item.href ? "text-cyan-300" : "text-white/45"
                    )} />
                  </div>
                  <span className="flex-1 text-sm font-medium">{item.label}</span>
                  {pathname === item.href && (
                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-400/80" />
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-white/[0.07] p-3">
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  );
}
