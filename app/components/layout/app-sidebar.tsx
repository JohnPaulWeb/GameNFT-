'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Download, Gift, Home, LifeBuoy, LogOut, Settings, Trophy } from 'lucide-react';
import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';

import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
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
    { label: 'Download', icon: Download, href: '/my-nfts', badge: '5' },
    { label: 'Gift Code', icon: Gift, href: '/mint' },
    { label: 'Top Review', icon: Trophy, href: '/advisor' },
    { label: 'Settings', icon: Settings, href: '/list' },
    { label: 'Support', icon: LifeBuoy, href: '/delist' },
  ];

  return (
    <Sidebar collapsible="none" className="border-r-0 bg-transparent [--sidebar-width:17rem]">
      <div className="relative flex h-full flex-col overflow-hidden border-r-0 bg-[#2d3640] shadow-[4px_0_36px_rgba(0,0,0,0.24)]">
        <SidebarHeader className="relative p-0 flex flex-col items-center justify-center pt-8 pb-6">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=60')" }} />
          <div className="absolute inset-0 bg-black/30" />
            
          <Avatar className="h-20 w-20 relative z-10 border-2 border-white/20 shadow-lg">
            {account ? (
              <AvatarImage
                src={`https://api.dicebear.com/8.x/notionists/svg?seed=${account.address}`}
                alt="Profile Avatar"
              />
            ) : (
                <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" alt="Avatar" />
            )}
            <AvatarFallback className="bg-[#3f4b56] text-sm font-semibold text-white">
              CH
            </AvatarFallback>
          </Avatar>
          <div className="relative z-10 mt-3 text-center">
            <h2 className="text-lg font-medium text-white">{userName}</h2>
          </div>
        </SidebarHeader>

        <SidebarContent className="flex-1 overflow-y-auto px-4 py-6">
          <SidebarMenu className="">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={cn(
                      'group relative flex h-14 w-full items-center gap-4 rounded-xl px-4 transition-all duration-300',
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/70 hover:bg-white/5 hover:text-white hover:tracking-wide'
                    )}
                  >
                    <Link href={item.href}>
                      <Icon
                        className={cn(
                          'h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110',
                          isActive ? 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]' : 'text-white/50'
                        )}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      
                      <span className="flex-1 font-medium tracking-wide">{item.label}</span>
                      <br />
                      <br />
                      {item.badge && (
                        <span className="absolute left-[34px] top-3 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-[#2d3640]">
                          {item.badge}
                        </span>
                      )}
                            
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
          
          <div className="mt-4 border-t border-white/10 pt-4 px-4">
              <button
                onClick={() => disconnect()}
                className="group relative flex h-14 w-full items-center gap-4 rounded-xl px-4 transition-all duration-300 text-white/70 hover:bg-white/5 hover:text-white hover:tracking-wide"
              >
                  <LogOut className="h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 text-white/50" strokeWidth={2} />
                  <span className="flex-1 text-left font-medium tracking-wide">Sign Out</span>
              </button>
          </div>
        </SidebarContent>
      </div>
    </Sidebar>
  );
}
