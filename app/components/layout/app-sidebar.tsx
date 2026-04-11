'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Download, Gift, Home, LifeBuoy, LogOut, Settings, Trophy, Search, Moon } from 'lucide-react';
import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';
import { useState } from 'react';

import { cn } from '@/app/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/app/components/ui/sidebar';


// ito yung AppSidebar component
export function AppSidebar() {
  const pathname = usePathname();
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const [darkMode, setDarkMode] = useState(true);

  
  const shortAddress = account
    ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}`
    : 'Web3 User';

  const userName = account?.label || shortAddress;

  const avatarSrc = account
    ? `https://api.dicebear.com/8.x/notionists/svg?seed=${account.address}`
    : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80';

  const menuItems = [
    { label: 'Home',    icon: Home,     href: '/marketplace' },
    { label: 'My NFTs', icon: Download, href: '/my-nfts', badge: '5' },
    { label: 'Mint',    icon: Gift,     href: '/mint' },
    { label: 'Advisor', icon: Trophy,   href: '/advisor' },
    { label: 'List',    icon: Settings, href: '/list' },
    { label: 'Delist',  icon: LifeBuoy, href: '/delist' },
  ];

  return (
    <Sidebar collapsible="none" className="border-r-0 bg-transparent [--sidebar-width:15.5rem]">
      <div
        className="flex h-full flex-col overflow-hidden"
        style={{
          background: '#18181b',
          borderRadius: '20px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.45)',
        }}
      >

        {/* ── Header: avatar square + name ── */}
        <div className="flex items-center gap-3 px-4 pt-5 pb-4">
          {/* Purple logo square */}
          <div style={{
            width: '42px', height: '42px', minWidth: '42px', minHeight: '42px',
            maxWidth: '42px', maxHeight: '42px',
            borderRadius: '12px',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #7c6ff7, #4f46e5)',
            boxShadow: '0 4px 14px rgba(99,91,255,0.45)',
            flexShrink: 0,
          }}>
            <img
              src={avatarSrc}
              alt="avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[14px] font-bold text-white leading-snug truncate">SuiPlay</span>
            <span className="text-[11px] text-white/40 leading-snug truncate">{userName}</span>
          </div>

          {/* ito yung Arrow button */}
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c6ff7, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: '0 2px 8px rgba(99,91,255,0.4)',
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M4.5 3L7.5 6L4.5 9" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* ── ito yung search sa sidebar  ── */}
        <div className="px-3 pb-3">
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '12px',
            height: '40px',
            padding: '0 14px',
          }}>
            <Search style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} strokeWidth={1.8} />
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.22)', userSelect: 'none' }}>Search...</span>
          </div>
        </div>

        {/* ── ito yung Nav ── */}
        <SidebarContent className="flex flex-col flex-1 overflow-hidden px-3 pt-1 pb-0">
          <SidebarMenu className="flex flex-col flex-1 justify-evenly gap-0">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              // ito yung sidebar menu item return statement
              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={cn(
                      'group relative flex h-11 w-full items-center gap-3 transition-all duration-150',
                      isActive ? 'text-white' : 'text-white/45 hover:text-white/80'
                    )}
                    style={{
                      borderRadius: '12px',
                      padding: '0 14px',
                      background: isActive
                        ? 'linear-gradient(135deg, #7c6ff7, #4f46e5)'
                        : 'transparent',
                      boxShadow: isActive ? '0 4px 16px rgba(99,91,255,0.35)' : 'none',
                    }}
                  >
                    {/* ito yung Link  */}
                    <Link href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                      <Icon
                        style={{
                          width: '17px', height: '17px', flexShrink: 0,
                          color: isActive ? 'white' : 'rgba(255,255,255,0.38)',
                        }}
                        strokeWidth={isActive ? 2.2 : 1.8}
                      />
                      <span style={{
                        flex: 1,
                        fontSize: '13.5px',
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
                      }}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          height: '18px', minWidth: '18px',
                          borderRadius: '999px',
                          background: '#ef4444',
                          padding: '0 5px',
                          fontSize: '9px', fontWeight: 700, color: 'white',
                        }}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>

          {/* ── Bottom: Logout + Dark Mode ── */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '8px', paddingBottom: '16px', paddingTop: '8px' }}>

            {/* Logout */}
            <button
              onClick={() => disconnect()}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                width: '100%', height: '42px',
                borderRadius: '12px', padding: '0 14px',
                color: 'rgba(255,255,255,0.38)',
                background: 'transparent',
                border: 'none', cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <LogOut style={{ width: '17px', height: '17px', flexShrink: 0 }} strokeWidth={1.8} />
              <span style={{ fontSize: '13.5px', fontWeight: 400 }}>Logout</span>
            </button>

            {/* ito yung Dark Mode toggle */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              width: '100%', height: '42px',
              borderRadius: '12px', padding: '0 14px',
              color: 'rgba(255,255,255,0.38)',
            }}>
              <Moon style={{ width: '17px', height: '17px', flexShrink: 0 }} strokeWidth={1.8} />
              <span style={{ flex: 1, fontSize: '13.5px', fontWeight: 400 }}>
                {darkMode ? 'Dark Mode' : 'Light Mode'}
              </span>
              {/* ito yung  Toggle switch */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                style={{
                  width: '36px', height: '20px',
                  borderRadius: '999px',
                  background: darkMode ? 'linear-gradient(135deg, #7c6ff7, #4f46e5)' : 'rgba(255,255,255,0.15)',
                  border: 'none', cursor: 'pointer',
                  position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                }}
              >
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  left: darkMode ? '18px' : '2px',
                  width: '16px', height: '16px',
                  borderRadius: '50%',
                  background: 'white',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                  transition: 'left 0.2s',
                  display: 'block',
                }} />
              </button>
            </div>

          </div>
        </SidebarContent>
      </div>
    </Sidebar>
  );
}