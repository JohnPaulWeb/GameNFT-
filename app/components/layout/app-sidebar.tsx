'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, Download, Gift, Home, LifeBuoy, LogOut, Settings, Trophy, Wallet2 } from 'lucide-react';
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
  const walletLabel = account
    ? `${account.address.slice(0, 8)}...${account.address.slice(-6)}`
    : 'Wallet not connected';
  const statusLabel = account ? 'Online' : 'Preview';
  const statusTone = account ? 'text-emerald-300' : 'text-amber-300';

  const menuItems = [
    { label: 'Home', icon: Home, href: '/marketplace' },
    { label: 'My-Nfts', icon: Download, href: '/my-nfts', badge: '5' },
    { label: 'Mint', icon: Gift, href: '/mint' },
    { label: 'Ai-Advisor', icon: Trophy, href: '/advisor' },
  ];

  const utilityItems = [
    { label: 'Settings', icon: Settings, href: '/list' },
    { label: 'Support', icon: LifeBuoy, href: '/delist' },
  ];

  return (
    <Sidebar collapsible="none" className="border-r-0 bg-transparent [--sidebar-width:17rem]">
      <div className="relative flex h-full flex-col overflow-hidden border-r border-white/10 bg-[#2d3640] shadow-[4px_0_36px_rgba(0,0,0,0.24)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/6 to-transparent" />
        </div>

        <SidebarHeader className="relative p-0">
          <div className="relative overflow-hidden border-b border-white/10">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01))]" />
            <div
              className="h-28 w-full bg-cover bg-center"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=60')" }}
            />

            <div className="relative -mt-8 px-4 pb-4">
              <div className="flex items-end gap-3">
                <Avatar className="h-16 w-16 border-2 border-white/35 shadow-xl shadow-black/40">
                {account ? (
                  <AvatarImage
                    src={`https://api.dicebear.com/8.x/notionists/svg?seed=${account.address}`}
                    alt="Profile Avatar"
                    data-ai-hint="profile avatar"
                  />
                ) : null}
                <AvatarFallback className="bg-[#3f4b56] text-sm font-semibold text-white">
                  {userName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

                <div className="min-w-0 flex-1 pb-1">
                  <p className="truncate text-xl font-semibold tracking-tight text-white">{userName}</p>
                  <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-black/25 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em]">
                    <span className={cn('h-1.5 w-1.5 rounded-full', account ? 'bg-emerald-400' : 'bg-amber-300')} />
                    <span className={statusTone}>{statusLabel}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Wallet</p>
                <p className="mt-1 font-mono text-xs text-cyan-200/90">{walletLabel}</p>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">Routes</p>
                  <p className="mt-1 text-sm font-semibold text-white">6 pages</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">State</p>
                  <p className={cn('mt-1 text-sm font-semibold', statusTone)}>{account ? 'Synced' : 'Offline'}</p>
                </div>
              </div>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="relative flex flex-1 flex-col px-2.5 py-4">
          <div className="mb-2 px-2.5">
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/35">Menu</p>
          </div>

          <SidebarMenu className="gap-1.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.label}
                    className={cn(
                      'h-auto rounded-xl border border-transparent bg-transparent p-0 text-white/75 transition-all duration-200 hover:border-white/10 hover:bg-white/5 hover:text-white',
                      isActive &&
                        'border-cyan-300/30 bg-cyan-400/10 text-white shadow-[0_10px_24px_rgba(34,211,238,0.12)]'
                    )}
                  >
                    <Link href={item.href} className="relative flex w-full items-center gap-3 px-3 py-3">
                      <span
                        className={cn(
                          'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-black/20 text-white/70 transition-colors',
                          isActive && 'border-cyan-300/35 bg-cyan-400/15 text-cyan-200'
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-medium tracking-tight text-current">{item.label}</span>
                      </span>

                      {item.badge ? (
                        <span className="rounded-full border border-rose-300/30 bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold text-rose-100">
                          {item.badge}
                        </span>
                      ) : null}

                      {isActive ? (
                        <span className="absolute left-0 top-2.5 bottom-2.5 w-0.5 rounded-r-full bg-cyan-300" />
                      ) : null}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>

          <div className="my-4 border-t border-white/10" />

          <SidebarMenu className="gap-1.5">
            {utilityItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.label}
                    className={cn(
                      'h-auto rounded-xl border border-transparent bg-transparent p-0 text-white/65 hover:border-white/10 hover:bg-white/5 hover:text-white',
                      isActive && 'border-cyan-300/30 bg-cyan-400/10 text-white'
                    )}
                  >
                    <Link href={item.href} className="flex w-full items-center gap-3 px-3 py-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-black/20 text-white/65">
                        <item.icon className="h-4 w-4" />
                      </span>
                      <span className="text-[15px] font-medium tracking-tight">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/12 text-cyan-300">
                <Wallet2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Creator Space</p>
                <p className="text-[11px] text-white/45">Manage minting and trading flow.</p>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-dashed border-white/12 bg-black/15 px-3 py-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">Quick signal</p>
              <p className="mt-1 text-xs leading-relaxed text-white/75">
                {account
                  ? 'Your wallet is ready for listing, minting, and purchase actions.'
                  : 'Connect a wallet to unlock on-chain minting and marketplace actions.'}
              </p>
            </div>
          </div>

          <div className="mt-auto pt-4">
            <Button
              variant="ghost"
              className="h-auto w-full justify-start rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-white/75 hover:border-white/20 hover:bg-white/10 hover:text-white"
              onClick={() => disconnect()}
              title="Disconnect Wallet"
            >
              <LogOut className="mr-3 h-4 w-4 text-white/55" />
              <span className="text-[15px] font-medium tracking-tight">Sign Out</span>
            </Button>
          </div>
        </SidebarContent>
      </div>
    </Sidebar>
  );
}
