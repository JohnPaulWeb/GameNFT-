'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, Gem, Home, LogOut, Sparkles, Wallet2 } from 'lucide-react';
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
  const statusLabel = account ? 'Live Wallet' : 'Preview Mode';
  const statusTone = account ? 'text-emerald-300' : 'text-amber-300';

  const menuItems = [
    { label: 'Home', icon: Home, href: '/marketplace' },
    { label: 'My NFTs', icon: Gem, href: '/my-nfts', badge: '5' },
    { label: 'Mint', icon: Gem, href: '/mint' },
    { label: 'AI Advisor', icon: Bot, href: '/advisor' },
  ];

  return (
    <Sidebar collapsible="none" className="border-r-0 bg-transparent [--sidebar-width:17.5rem]">
      <div className="relative flex h-full flex-col overflow-hidden border-r border-white/[0.08] bg-[linear-gradient(180deg,rgba(7,11,26,0.96),rgba(10,14,32,0.9))] backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-400/10 to-transparent" />
          <div className="absolute left-[-20%] top-16 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-24 right-[-25%] h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        </div>

        <SidebarHeader className="relative border-b border-white/[0.08] px-4 pb-4 pt-5">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/30 bg-gradient-to-br from-cyan-400/20 via-cyan-300/10 to-indigo-500/20 shadow-[0_0_30px_rgba(34,211,238,0.12)]">
                <Sparkles className="h-5 w-5 text-cyan-300" />
              </div>
              <div>
                <p className="font-display text-base font-semibold tracking-tight text-white">SuiPlay</p>
                <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300/70">Control Deck</p>
              </div>
            </div>
            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Sui Live
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_52%)]" />
            <div className="relative flex items-start gap-3">
              <Avatar className="h-14 w-14 border border-white/15 shadow-lg shadow-cyan-500/10">
                {account ? (
                  <AvatarImage
                    src={`https://api.dicebear.com/8.x/notionists/svg?seed=${account.address}`}
                    alt="Profile Avatar"
                    data-ai-hint="profile avatar"
                  />
                ) : null}
                <AvatarFallback className="bg-white/10 text-sm font-semibold text-white">
                  {userName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg font-semibold tracking-tight text-white">{userName}</p>
                <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/55">
                  <span className={cn('h-1.5 w-1.5 rounded-full', account ? 'bg-emerald-400' : 'bg-amber-400')} />
                  <span className={statusTone}>{statusLabel}</span>
                </div>
              </div>
            </div>

            <div className="relative mt-4 grid gap-3">
              <div className="rounded-2xl border border-white/[0.08] bg-black/20 px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Wallet</p>
                <p className="mt-1 font-mono text-xs text-cyan-200/90">{walletLabel}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">Collection</p>
                  <p className="mt-1 text-sm font-semibold text-white">04 routes</p>
                </div>
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">Status</p>
                  <p className={cn('mt-1 text-sm font-semibold', statusTone)}>{account ? 'Synced' : 'Offline'}</p>
                </div>
              </div>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="relative flex flex-1 flex-col px-3 py-4">
          <div className="mb-3 px-2">
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/35">Navigation</p>
          </div>

          <SidebarMenu className="gap-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.label}
                    className={cn(
                      'h-auto rounded-[22px] border border-transparent bg-transparent p-0 text-white/72 transition-all duration-200 hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-white',
                      isActive &&
                        'border-cyan-400/20 bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(99,102,241,0.12))] text-white shadow-[0_0_30px_rgba(34,211,238,0.1)]'
                    )}
                  >
                    <Link href={item.href} className="relative flex w-full items-center gap-3 px-3.5 py-3.5">
                      <span
                        className={cn(
                          'inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-black/20 text-white/70 transition-colors',
                          isActive && 'border-cyan-300/30 bg-cyan-400/10 text-cyan-200'
                        )}
                      >
                        <item.icon className="h-4.5 w-4.5" />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold tracking-tight text-current">{item.label}</span>
                        <span className="block text-[11px] text-white/40">Open dashboard</span>
                      </span>

                      {item.badge ? (
                        <span className="rounded-full border border-rose-400/25 bg-rose-500/10 px-2 py-1 text-[10px] font-semibold text-rose-200">
                          {item.badge}
                        </span>
                      ) : null}

                      {isActive ? (
                        <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-gradient-to-b from-cyan-300 via-cyan-400 to-indigo-400" />
                      ) : null}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>

          <div className="mt-6 rounded-[26px] border border-white/[0.08] bg-white/[0.03] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                <Wallet2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Creator cockpit</p>
                <p className="text-[11px] text-white/45">Mint, manage, and review your market flow.</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-black/15 px-3 py-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">Quick signal</p>
              <p className="mt-1 text-sm text-white/75">
                {account
                  ? 'Your wallet is ready for listing, minting, and purchase actions.'
                  : 'Connect a wallet to unlock on-chain minting and marketplace actions.'}
              </p>
            </div>
          </div>

          <div className="mt-auto pt-6">
            <Button
              variant="ghost"
              className="h-auto w-full justify-start rounded-[22px] border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-white/75 hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
              onClick={() => disconnect()}
              title="Disconnect Wallet"
            >
              <LogOut className="mr-3 h-4 w-4 text-white/55" />
              <span className="text-sm font-semibold tracking-tight">Disconnect wallet</span>
            </Button>
          </div>
        </SidebarContent>
      </div>
    </Sidebar>
  );
}
