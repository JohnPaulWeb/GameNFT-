'use client';

import { AppSidebar } from '@/app/components/layout/app-sidebar';
import { AppHeader } from '@/app/components/layout/app-header';
import { SidebarProvider, SidebarInset } from '@/app/components/ui/sidebar';
import { Providers } from '@/app/components/providers';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-screen overflow-hidden bg-[hsl(var(--bg-primary))] relative">
          {/* Refined Background with subtle gradients */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
            {/* Subtle aurora effect - refined blue */}
            <div
              className="absolute -top-1/3 -left-1/4 w-[100%] h-[100%] rounded-full opacity-[0.08] blur-[100px]"
              style={{
                background: 'radial-gradient(circle, rgba(74, 123, 167, 0.25), rgba(74, 123, 167, 0.15), transparent 65%)',
                animation: 'aurora 30s ease-in-out infinite',
              }}
            />

            {/* Subtle bronze accent - top right */}
            <div
              className="absolute -top-1/4 -right-1/4 w-[80%] h-[80%] rounded-full opacity-[0.06] blur-[90px]"
              style={{
                background: 'radial-gradient(circle, rgba(212, 163, 115, 0.2), rgba(212, 163, 115, 0.1), transparent 60%)',
                animation: 'glow-pulse 28s ease-in-out infinite',
                animationDelay: '2s',
              }}
            />

            {/* Subtle emerald accent - bottom center */}
            <div
              className="absolute -bottom-1/4 left-1/3 w-[70%] h-[70%] rounded-full opacity-[0.05] blur-[90px]"
              style={{
                background: 'radial-gradient(circle, rgba(104, 168, 147, 0.2), rgba(104, 168, 147, 0.1), transparent 60%)',
                animation: 'glow-pulse 26s ease-in-out infinite',
                animationDelay: '4s',
              }}
            />

            {/* Minimal grid overlay */}
            <div 
              className="absolute inset-0 opacity-[0.01]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(212, 163, 115, 0.08) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(212, 163, 115, 0.08) 1px, transparent 1px)
                `,
                backgroundSize: '120px 120px',
              }}
            />
          </div>

          <AppSidebar />
          <SidebarInset className="flex min-w-0 flex-1 flex-col overflow-hidden bg-transparent relative">
            <AppHeader />
            <main className="min-h-0 flex-1 overflow-y-auto relative">
              <div className="relative min-h-full">
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
