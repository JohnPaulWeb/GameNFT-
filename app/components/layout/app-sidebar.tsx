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
      <div className="relative p-4 rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/8 transition-all duration-300 shadow-lg overflow-hidden group">
        {/* Hover glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl blur-xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.1), transparent)',
          }}
        />
        
        <div className="flex items-center gap-3 relative z-10">
          <Avatar className="h-12 w-12 border-2 border-cyan-400/30 shadow-lg shadow-cyan-400/20">
            <AvatarImage
              src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${account.address}`}
              alt="User Avatar"
              data-ai-hint="user avatar"
            />
            <AvatarFallback className="bg-cyan-400/20 text-cyan-300 font-bold">{account.address.slice(2, 4).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden flex-1">
            <span className="font-bold truncate text-sm text-white">
              {account.label || `${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-secondary))]">
              <Wallet className="size-3.5 text-cyan-300" />
              <span className="font-semibold">
                  {isLoading && 'Loading...'}
                  {!isLoading && (
                    <>
                      <span className="text-cyan-300">{balanceInSui}</span> SUI
                    </>
                  )}
              </span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto h-9 w-9 hover:bg-red-500/20 hover:text-red-400 transition-colors" 
            onClick={() => disconnect()}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Sidebar collapsible="none" className="border-r border-white/10 bg-[hsl(var(--bg-void))] backdrop-blur-xl relative overflow-hidden">
      {/* Sidebar ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-0 left-0 w-full h-64 opacity-10 blur-3xl"
          style={{
            background: 'radial-gradient(ellipse, rgba(16, 240, 252, 0.3), transparent)',
          }}
        />
      </div>

      <SidebarHeader className="border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent relative">
        <div className="flex items-center gap-3 px-4 py-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/30 to-cyan-500/10 border border-cyan-400/40 shadow-lg shadow-cyan-400/20 relative">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400/0 to-cyan-500/20" />
            <span className="text-2xl font-bold text-cyan-300 relative z-10">◆</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold font-display text-white leading-tight tracking-tight">SuiPlay</span>
            <span className="text-xs text-cyan-300 font-semibold tracking-wide">NFT MARKETPLACE</span>
          </div>
        </div>
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
      </SidebarHeader>
      <SidebarContent className="gap-0 px-0 relative">
        <SidebarMenu className="gap-2 px-3 py-4">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
                className={cn(
                  "relative rounded-xl transition-all duration-300 font-medium text-[hsl(var(--text-secondary))] hover:text-white hover:bg-white/10 group",
                  pathname === item.href && "bg-gradient-to-r from-cyan-500/25 to-cyan-500/10 border border-cyan-400/50 text-cyan-300 hover:text-cyan-200 shadow-lg shadow-cyan-400/10"
                )}
              >
                <Link href={item.href} className="flex items-center gap-3 px-4 py-3 w-full">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300",
                    pathname === item.href ? "bg-cyan-400/20 border border-cyan-400/30" : "bg-white/5 border border-white/10 group-hover:bg-white/10"
                  )}>
                    <item.icon className={cn(
                      "h-5 w-5 transition-colors",
                      pathname === item.href && "text-cyan-300"
                    )} />
                  </div>
                  <span className="flex-1 text-sm font-semibold">{item.label}</span>
                  {pathname === item.href && (
                    <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-white/10 bg-gradient-to-t from-white/5 to-transparent relative">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  );
}
