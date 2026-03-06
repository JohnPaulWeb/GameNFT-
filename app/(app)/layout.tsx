'use client';

import { AppNavbar } from '@/app/components/layout/app-navbar';
import { Providers } from '@/app/components/providers';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="flex flex-col min-h-screen w-full bg-[hsl(var(--bg-primary))]">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div
            className="absolute -top-1/3 -left-1/4 w-[100%] h-[100%] rounded-full opacity-[0.08] blur-[100px]"
            style={{
              background: 'radial-gradient(circle, rgba(74, 123, 167, 0.25), rgba(74, 123, 167, 0.15), transparent 65%)',
              animation: 'aurora 30s ease-in-out infinite',
            }}
          />
          <div
            className="absolute -top-1/4 -right-1/4 w-[80%] h-[80%] rounded-full opacity-[0.06] blur-[90px]"
            style={{
              background: 'radial-gradient(circle, rgba(212, 163, 115, 0.2), rgba(212, 163, 115, 0.1), transparent 60%)',
              animation: 'glow-pulse 28s ease-in-out infinite',
              animationDelay: '2s',
            }}
          />
          <div
            className="absolute -bottom-1/4 left-1/3 w-[70%] h-[70%] rounded-full opacity-[0.05] blur-[90px]"
            style={{
              background: 'radial-gradient(circle, rgba(104, 168, 147, 0.2), rgba(104, 168, 147, 0.1), transparent 60%)',
              animation: 'glow-pulse 26s ease-in-out infinite',
              animationDelay: '4s',
            }}
          />
        </div>

        <AppNavbar />
        <main className="flex-1 w-full relative">
          {children}
        </main>
      </div>
    </Providers>
  );
}
