'use client';

import React from 'react';
import { useData } from '@/app/data-provider';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { MainNav } from '@/components/main-nav';
import { UserNav } from '@/components/user-nav';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface LayoutClientProps {
  children: React.ReactNode;
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, signInWithGoogle, isLoading } = useData();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Dialog open={true}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-center">Welcome to ProspectorAI</DialogTitle>
              <DialogDescription className="text-center">
                Please sign in with your Google account to continue.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-6 py-6">
              <div className="w-32">
                <Logo />
              </div>
              <Button size="lg" onClick={signInWithGoogle}>
                Sign in with Google
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return children;
}

export function LayoutClient({ children }: LayoutClientProps) {
  return (
    <SidebarProvider>
      <AuthGuard>
        <div className="flex min-h-screen">
          <Sidebar className="z-50">
            <SidebarHeader className="border-b px-6 py-3">
              <div className="w-32">
                <Logo />
              </div>
            </SidebarHeader>
            <SidebarContent>
              <MainNav />
            </SidebarContent>
            <SidebarInset className="absolute bottom-4 left-4 right-4">
              <UserNav />
            </SidebarInset>
            <SidebarTrigger />
          </Sidebar>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </AuthGuard>
    </SidebarProvider>
  );
}
