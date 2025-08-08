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
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface LayoutClientProps {
  children: React.ReactNode;
}

export function LayoutClient({ children }: LayoutClientProps) {
  const { user, signInWithGoogle } = useData();
  const [open, setOpen] = React.useState(true);

  React.useEffect(() => {
    if (user) setOpen(false);
    else setOpen(true);
  }, [user]);

  return (
    <SidebarProvider>
      {/* Auth Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex flex-col items-center gap-8 py-10">
            <div className="w-40">
              <Logo />
            </div>
            <Button onClick={signInWithGoogle}>Sign in with Google</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex min-h-screen">
        <Sidebar>
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
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </SidebarProvider>
  );
}
