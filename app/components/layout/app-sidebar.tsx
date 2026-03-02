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
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex w-full flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
      );
    }

    const balanceInSui = coinBalance ? (Number(coinBalance.totalBalance) / 1_000_000_000).toFixed(2) : '0.00';

    return (
      <div className="relative p-4 rounded-xl border border-white/[0.12] bg-gradient-to-br from-white/[0.09] via-white/[0.05] to-transparent hover:from-white/[0.12] hover:via-white/[0.08] transition-all duration-300 shadow-xl shadow-black/10 overflow-hidden group backdrop-blur-sm">
        {/* Enhanced hover glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl blur-2xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(16, 240, 252, 0.15), rgba(99, 102, 241, 0.08), transparent)',
          }}
        />
        
        {/* Subtle animated border */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 240, 252, 0.2), rgba(99, 102, 241, 0.15), rgba(236, 72, 153, 0.1))',
            backgroundSize: '200% 200%',
            animation: 'gradient-shift 3s ease infinite',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            padding: '1px',
          }}
        />
        
        <div className="flex items-center gap-3 relative z-10">
          <div className="relative">
            <Avatar className="h-12 w-12 border-2 border-cyan-400/40 shadow-xl shadow-cyan-400/20 transition-all duration-300 group-hover:border-cyan-400/60 group-hover:shadow-2xl group-hover:shadow-cyan-400/30 group-hover:scale-105">
              <AvatarImage
                src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${account.address}`}
                alt="User Avatar"
                data-ai-hint="user avatar"
              />
              <AvatarFallback className="bg-gradient-to-br from-cyan-400/30 to-indigo-500/20 text-cyan-300 font-bold text-sm">{account.address.slice(2, 4).toUpperCase()}</AvatarFallback>
            </Avatar>
            {/* Online indicator */}
            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[hsl(var(--bg-void))] shadow-lg shadow-emerald-400/50 animate-pulse" />
          </div>
          
          <div className="flex flex-col overflow-hidden flex-1 min-w-0">
            <span className="font-bold truncate text-sm text-white transition-colors">
              {account.label || `${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-secondary))] transition-colors group-hover:text-[hsl(var(--text-primary))]">
              <Wallet className="size-3.5 text-cyan-300 transition-transform duration-300 group-hover:scale-110" />
              <span className="font-semibold truncate">
                  {isLoading && <span className="text-cyan-300/70">Loading...</span>}
                  {!isLoading && (
                    <>
                      <span className="text-cyan-300 font-bold">{balanceInSui}</span>
                      <span className="text-white/60 ml-0.5">SUI</span>
                    </>
                  )}
              </span>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto h-9 w-9 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300 hover:scale-110 active:scale-95 rounded-lg" 
            onClick={() => disconnect()}
            title="Disconnect Wallet"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Sidebar collapsible="none" className="border-r border-white/[0.08] bg-gradient-to-b from-[hsl(var(--bg-void))] to-[hsl(var(--bg-primary))] backdrop-blur-xl relative overflow-hidden shadow-2xl shadow-black/20">
      {/* Enhanced sidebar ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-20 left-0 w-full h-80 opacity-[0.08] blur-[100px]"
          style={{
            background: 'radial-gradient(ellipse, rgba(16, 240, 252, 0.4), rgba(99, 102, 241, 0.3), transparent)',
          }}
        />
        <div 
          className="absolute bottom-0 left-0 w-full h-60 opacity-[0.06] blur-[80px]"
          style={{
            background: 'radial-gradient(ellipse, rgba(139, 92, 246, 0.3), transparent)',
          }}
        />
      </div>
      
      <SidebarHeader className="border-b border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent relative backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-5 group cursor-pointer transition-all duration-300 hover:bg-white/[0.02] rounded-xl mx-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/30 via-indigo-500/20 to-purple-500/15 border border-cyan-400/40 shadow-xl shadow-cyan-400/25 relative overflow-hidden transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-cyan-400/35 group-hover:scale-105">
            {/* Inner shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="text-2xl font-bold text-cyan-300 relative z-10 transition-transform duration-300 group-hover:scale-110">◆</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold font-display text-white leading-tight tracking-tight transition-colors group-hover:text-cyan-100">SuiPlay</span>
            <span className="text-[10px] text-cyan-300 font-semibold tracking-wider transition-colors group-hover:text-cyan-200">NFT MARKETPLACE</span>
          </div>
        </div>
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
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
                  "relative rounded-xl transition-all duration-300 font-medium text-[hsl(var(--text-secondary))] hover:text-white hover:bg-white/[0.08] group overflow-hidden",
                  pathname === item.href && "bg-gradient-to-r from-cyan-500/20 via-cyan-500/15 to-indigo-500/10 border border-cyan-400/40 text-cyan-200 hover:text-cyan-100 shadow-xl shadow-cyan-400/15 hover:shadow-2xl hover:shadow-cyan-400/20"
                )}
              >
                <Link href={item.href} className="flex items-center gap-3 px-4 py-3 w-full relative z-10">
                  {/* Hover shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 pointer-events-none" />
                  
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 shadow-inner",
                    pathname === item.href 
                      ? "bg-gradient-to-br from-cyan-400/25 to-indigo-500/15 border border-cyan-400/40 shadow-lg shadow-cyan-400/20" 
                      : "bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 group-hover:scale-105"
                  )}>
                    <item.icon className={cn(
                      "h-5 w-5 transition-all duration-300",
                      pathname === item.href && "text-cyan-300",
                      pathname !== item.href && "group-hover:scale-110"
                    )} />
                  </div>
                  <span className="flex-1 text-sm font-semibold">{item.label}</span>
                  {pathname === item.href && (
                    <div className="relative">
                      <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                      <div className="absolute inset-0 h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                    </div>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-white/[0.08] bg-gradient-to-t from-white/[0.04] to-transparent relative backdrop-blur-sm">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  );
}
