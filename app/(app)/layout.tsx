'use client';

import { AppSidebar } from '@/app/components/layout/app-sidebar';
import { AppHeader } from '@/app/components/layout/app-header';
import { SidebarProvider, SidebarInset } from '@/app/components/ui/sidebar';
import { Providers } from '@/app/components/providers';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-screen overflow-hidden bg-[hsl(var(--background))] relative">
          {/* Animated Background Layers */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {/* Aurora effect - top left */}
            <div
              className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full opacity-20 blur-3xl"
              style={{
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3), rgba(187, 100, 253, 0.2), transparent)',
                animation: 'aurora 20s ease-in-out infinite',
              }}
            />

            {/* Glow effection - top right */}
            <div
              className="absolute -top-1/3 -right-1/3 w-2/3 h-2/3 rounded-full opacity-15 blur-3xl"
              style={{
                background: 'radial-gradient(circle, rgba(16, 240, 252, 0.4), rgba(99, 102, 241, 0.2), transparent)',
                animation: 'glow-pulse 15s ease-in-out infinite',
                animationDelay: '2s',
              }}
            />

            {/* Bottom accent glow */}
            <div
              className="absolute -bottom-1/2 left-1/3 w-2/3 h-2/3 rounded-full opacity-10 blur-3xl"
              style={{
                background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3), rgba(245, 158, 11, 0.2), transparent)',
                animation: 'glow-pulse 18s ease-in-out infinite',
                animationDelay: '5s',
              }}
            />

            {/* Floating particles */}
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
                style={{
                  left: `${20 + i * 15}%`,
                  bottom: '-10px',
                  animation: `float-up ${20 + i * 5}s linear infinite`,
                  animationDelay: `${i * 3}s`,
                }}
              />
            ))}
          </div>

          <AppSidebar />
          <SidebarInset className="flex min-w-0 flex-1 flex-col overflow-hidden bg-transparent relative">
            <AppHeader />
            <main className="min-h-0 flex-1 overflow-y-auto relative">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </Providers>
  );
}
