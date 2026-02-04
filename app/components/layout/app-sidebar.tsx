'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, Gem, LayoutGrid, LogOut, PlusCircle, Wallet } from 'lucide-react';
import { useCurrentAccount, useDisconnectWallet, useSuiClient } from '@mysten/dapp-kit';
import { useQuery } from '@tanstack/react-query';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
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
        <div className="flex items-center gap-3 p-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex w-full flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
      );
    }

    const balanceInSui = coinBalance ? (Number(coinBalance.totalBalance) / 1_000_000_000).toFixed(2) : '0.00';

    return (
      <div className="flex items-center gap-3 p-2">
        <Avatar>
          <AvatarImage
            src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${account.address}`}
            alt="User Avatar"
            data-ai-hint="user avatar"
          />
          <AvatarFallback>{account.address.slice(2, 4).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col overflow-hidden">
          <span className="font-medium truncate text-sm">
            {account.label || `${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Wallet className="size-3" />
            <span>
                {isLoading && 'Loading...'}
                {!isLoading && `${balanceInSui} SUI`}
            </span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="ml-auto" onClick={() => disconnect()}>
          <LogOut className="size-4" />
        </Button>
      </div>
    )
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo className="size-8 text-primary" />
          <span className="text-lg font-semibold">SuiPlay</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  );
}
