'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@mysten/dapp-kit';
import { Zap, Plus } from 'lucide-react';

export function AppNavbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/marketplace', label: 'Explore', icon: Zap },
    { href: '/mint', label: 'Create', icon: Plus },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-primary))]/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/marketplace" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--accent-indigo))] to-[hsl(var(--accent-cyan))] flex items-center justify-center">
            <span className="text-white font-bold text-sm">◆</span>
          </div>
          <span className="font-semibold text-white">SuiPlay</span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                pathname === href
                  ? 'text-[hsl(var(--accent-indigo))]'
                  : 'text-[hsl(var(--text-secondary))] hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Connect Button */}
        <div className="flex items-center gap-2">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
