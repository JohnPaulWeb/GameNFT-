'use client';

import { AppSidebar } from '@/app/components/layout/app-sidebar';
import { AppHeader } from '@/app/components/layout/app-header';
import { SidebarProvider, SidebarInset } from '@/app/components/ui/sidebar';
import { Providers } from '@/app/components/providers';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-screen overflow-hidden bg-[hsl(var(--bg-void))] relative">
          {/*ito yung Enhanced Animated Background Layers */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {/* ito yung Primary aurora effect - top left */}
            <div
              className="absolute -top-1/2 -left-1/2 w-[140%] h-[140%] rounded-full opacity-[0.15] blur-[120px]"
              style={{
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.35), rgba(139, 92, 246, 0.25), rgba(187, 100, 253, 0.15), transparent 70%)',
                animation: 'aurora 25s ease-in-out infinite',
              }}
            />

            {/*ito yung Cyan glow - top right */}
            <div
              className="absolute -top-1/3 -right-1/3 w-[100%] h-[100%] rounded-full opacity-[0.12] blur-[100px]"
              style={{
                background: 'radial-gradient(circle, rgba(16, 240, 252, 0.4), rgba(6, 182, 212, 0.25), rgba(99, 102, 241, 0.15), transparent 65%)',
                animation: 'glow-pulse 18s ease-in-out infinite',
                animationDelay: '2s',
              }}
            />

            {/* ito yung Bottom accent glow - warmer tones */}
            <div
              className="absolute -bottom-1/2 left-1/4 w-[90%] h-[90%] rounded-full opacity-[0.08] blur-[100px]"
              style={{
                background: 'radial-gradient(circle, rgba(236, 72, 153, 0.35), rgba(245, 158, 11, 0.2), rgba(251, 146, 60, 0.15), transparent 70%)',
                animation: 'glow-pulse 22s ease-in-out infinite',
                animationDelay: '6s',
              }}
            />

            {/* ito yung Center accent - subtle emerald */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full opacity-[0.06] blur-[80px]"
              style={{
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25), rgba(99, 102, 241, 0.15), transparent 60%)',
                animation: 'glow-pulse 20s ease-in-out infinite',
                animationDelay: '4s',
              }}
            />

            {/* ito yung Enhanced grid overlay for depth */}
            <div 
              className="absolute inset-0 opacity-[0.015]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(16, 240, 252, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(16, 240, 252, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '100px 100px',
              }}
            />

            {/*ito yung  Floating particles - improved */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${2 + (i % 3)}px`,
                  height: `${2 + (i % 3)}px`,
                  background: i % 3 === 0 
                    ? 'rgba(16, 240, 252, 0.4)' 
                    : i % 3 === 1 
                    ? 'rgba(139, 92, 246, 0.35)' 
                    : 'rgba(236, 72, 153, 0.3)',
                  left: `${10 + i * 11}%`,
                  bottom: '-20px',
                  animation: `float-up ${25 + i * 6}s linear infinite`,
                  animationDelay: `${i * 2.5}s`,
                  boxShadow: i % 2 === 0 ? '0 0 10px currentColor' : 'none',
                }}
              />
            ))}

            {/*ito yung Subtle scan line effect */}
            <div
              className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent"
              style={{
                animation: 'scan-line 8s ease-in-out infinite',
              }}
            />
          </div>

          <AppSidebar />
          <SidebarInset className="flex min-w-0 flex-1 flex-col overflow-hidden bg-transparent relative">
            <AppHeader />
            <main className="min-h-0 flex-1 overflow-y-auto relative">
              {/*ito yung Content wrapper with subtle vignette */}
              <div className="relative min-h-full">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-[hsl(var(--bg-void))]/40" />
                <div className="relative z-10">
                  {children}
                </div>
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </Providers>
  );
}
