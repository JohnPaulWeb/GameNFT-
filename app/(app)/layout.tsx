'use client';

import { AppFooter } from '@/app/components/layout/app-footer';
import { AppSidebar } from '@/app/components/layout/app-sidebar';
import { AppHeader } from '@/app/components/layout/app-header';
import { SidebarProvider, SidebarInset } from '@/app/components/ui/sidebar';
import { Providers } from '@/app/components/providers';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <SidebarProvider defaultOpen={true}>
        <div className="relative flex h-screen w-screen overflow-hidden bg-[#212a33]">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-32 -right-20 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.022)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
          </div>

          <AppSidebar />
          <SidebarInset className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-transparent p-0 md:p-4">
            <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden border border-white/10 bg-[linear-gradient(180deg,rgba(14,20,30,0.9),rgba(10,14,22,0.95))] shadow-[0_22px_70px_rgba(0,0,0,0.35)] md:rounded-[22px]">
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/45 to-transparent" />
                <div className="absolute left-[8%] top-[-15%] h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl" />
                <div className="absolute bottom-[-20%] right-[12%] h-60 w-60 rounded-full bg-indigo-500/10 blur-3xl" />
              </div>

              <AppHeader />
              <main className="relative min-h-0 flex-1 overflow-y-auto">
                <div className="relative flex min-h-full flex-col">
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-black/30" />
                  <div className="relative z-10 flex min-h-full flex-col">
                    <div className="flex-1">{children}</div>
                    <AppFooter />
                  </div>
                </div>
              </main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </Providers>
  );
}
