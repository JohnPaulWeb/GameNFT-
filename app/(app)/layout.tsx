'use client';

import { AppSidebar } from '@/app/components/layout/app-sidebar';
import { AppHeader } from '@/app/components/layout/app-header';
import { SidebarProvider, SidebarInset } from '@/app/components/ui/sidebar';
import { Providers } from '@/app/components/providers';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <SidebarProvider>
        <div className="flex h-screen w-full overflow-hidden">
          <AppSidebar />
          <SidebarInset className="flex flex-1 flex-col overflow-hidden">
            <AppHeader />
            <main className="flex-1 overflow-y-auto bg-background/95 p-4 sm:p-6 lg:p-8">
              <div className="mx-auto w-full max-w-[1920px]">
                {children}
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </Providers>
  );
}
