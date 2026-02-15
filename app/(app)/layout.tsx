'use client';

import { AppSidebar } from '@/app/components/layout/app-sidebar';
import { AppHeader } from '@/app/components/layout/app-header';
import { SidebarProvider, SidebarInset } from '@/app/components/ui/sidebar';
import { Providers } from '@/app/components/providers';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-screen overflow-hidden bg-background">
          <AppSidebar />
          <SidebarInset className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <AppHeader />
            <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              <div className="mx-auto w-full max-w-7xl">
                {children}
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </Providers>
  );
}
