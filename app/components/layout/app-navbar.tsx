'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@mysten/dapp-kit';

export function AppNavbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/mint', label: 'Create' },
    { href: '#', label: 'Collections' },
    { href: '#', label: 'About' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-primary))]/80 backdrop-blur-xl">
      <div className="px-6 md:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          {/* Logo - Left */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--accent-indigo))] via-[hsl(var(--accent-cyan))] to-[hsl(var(--accent-rose))] flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white font-bold text-sm">◆</span>
            </div>
            <span className="font-semibold text-white text-lg tracking-tight hidden sm:inline">SuiPlay</span>
          </Link>

          {/* Center Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                  pathname === link.href
                    ? 'text-[hsl(var(--accent-indigo))] bg-[hsl(var(--accent-indigo))]/10'
                    : 'text-[hsl(var(--text-secondary))] hover:text-white hover:bg-[hsl(var(--bg-secondary))]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side - Connect Button */}
          <div className="flex items-center gap-2 shrink-0">
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
