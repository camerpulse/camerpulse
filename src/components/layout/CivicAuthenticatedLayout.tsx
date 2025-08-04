import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { CivicAppSidebar } from '@/components/layout/CivicAppSidebar';
import { CivicAppHeader } from '@/components/layout/CivicAppHeader';
import { Toaster } from '@/components/ui/toaster';

interface CivicAuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function CivicAuthenticatedLayout({ children }: CivicAuthenticatedLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <CivicAppSidebar />
        <div className="flex-1 flex flex-col">
          <CivicAppHeader />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}