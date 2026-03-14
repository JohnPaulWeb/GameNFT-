'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Download, Gem, Home, LifeBuoy, LogOut, Settings, Trophy } from 'lucide-react';
import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';

import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/app/components/ui/sidebar';
export function AppSidebar() {
  const pathname = usePathname();
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();

  const userName =
    account?.label ||
    (account ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}` : 'Catriona Henderson');

  const menuItems = [
    { label: 'Home', icon: Home, href: '/marketplace' },
    { label: 'My-NFTS', icon: Download, href: '/my-nfts', badge: '5' },
    { label: 'Mint', icon: Gem, href: '/mint' },
    { label: 'Ai-Advisor', icon: Trophy, href: '/advisor' },
    // { label: 'Settings', icon: Settings },
    // { label: 'Support', icon: LifeBuoy },
  ];

  return (
    <Sidebar collapsible="none" className="border-r border-[#2f3640] bg-[#323943] [--sidebar-width:15.2rem]">
      <SidebarHeader className="border-b border-[#3b424d] p-0">
        <div className="relative h-44 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(rgba(16,22,32,0.2),rgba(16,22,32,0.72)),url('https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=60')",
            }}
          />
          <div className="absolute inset-x-0 top-7 flex justify-center">
            <Avatar className="h-[5.1rem] w-[5.1rem] border-2 border-white/85 shadow-lg">
              {account ? (
                <AvatarImage
                  src={`https://api.dicebear.com/8.x/notionists/svg?seed=${account.address}`}
                  alt="Profile Avatar"
                  data-ai-hint="profile avatar"
                />
              ) : null}
              <AvatarFallback className="bg-white/20 text-sm font-semibold text-white">
                {userName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="absolute inset-x-0 bottom-6 px-4 text-center">
            <p className="truncate text-[1.32rem] font-medium tracking-tight text-white">{userName}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-0 py-0">
        <SidebarMenu className="gap-0">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label} className="border-b border-[#3b424d]/85">
              {item.href ? (
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                  className={cn(
                    'h-auto rounded-none border-0 bg-transparent p-0 text-[#e2e7ef] hover:bg-[#3a424d] hover:text-white',
                    pathname === item.href && 'bg-[#3a424d] text-white'
                  )}
                >
                  <Link href={item.href} className="relative flex w-full items-center gap-4 px-6 py-[1.06rem]">
                    <span
                      className={cn(
                        'inline-flex h-4 w-4 items-center justify-center text-white/65',
                        pathname === item.href && 'text-white'
                      )}
                    >
                      <item.icon className="h-[0.95rem] w-[0.95rem]" />
                    </span>
                    <span className="text-[1.02rem] font-normal text-[#e3e8ef]">{item.label}</span>
                    {'badge' in item && item.badge ? (
                      <span className="absolute left-[2.12rem] top-[0.54rem] h-3.5 min-w-3.5 rounded-full bg-[#ff3b30] px-1 text-center text-[9px] font-semibold leading-[14px] text-white">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                </SidebarMenuButton>
              ) : (
                <Button
                  variant="ghost"
                  className="h-auto w-full justify-start rounded-none border-0 px-6 py-[1.06rem] text-[#e2e7ef] hover:bg-[#3a424d] hover:text-white"
                >
                  <item.icon className="mr-4 h-[0.95rem] w-[0.95rem] text-white/65" />
                  <span className="text-[1.02rem] font-normal">{item.label}</span>
                </Button>
              )}
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem className="border-b border-[#3b424d]/85">
            <Button
              variant="ghost"
              className="h-auto w-full justify-start rounded-none border-0 px-6 py-[1.06rem] text-[#e2e7ef] hover:bg-[#3a424d] hover:text-white"
              onClick={() => disconnect()}
              title="Disconnect Wallet"
            >
              <LogOut className="mr-4 h-[0.95rem] w-[0.95rem] text-white/65" />
              <span className="text-[1.02rem] font-normal">Sign Out</span>
            </Button>
          </SidebarMenuItem>
          <SidebarMenuItem className="flex-1 border-b-0" />
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
