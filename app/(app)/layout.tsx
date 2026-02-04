'use client';

import { AppSidebar } from '@/app/components/layout/app-sidebar';
import { AppHeader } from '@/app/components/layout/app-header';
import { SidebarProvider, SidebarInset } from '@/app/components/ui/sidebar';
import { Providers } from '@/app/components/providers';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </Providers>
  );
}
