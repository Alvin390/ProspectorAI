import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { Logo } from '@/components/logo';
import { MainNav } from '@/components/main-nav';
import { UserNav } from '@/components/user-nav';
import { useData } from '@/app/data-provider';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import React from 'react';

export const metadata: Metadata = {
  title: 'ProspectorAI',
  description: 'AI-powered lead prospecting and outreach.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Use DataProvider context for auth state
  const { user, signInWithGoogle } = useData();
  const [open, setOpen] = React.useState(true);

  React.useEffect(() => {
    if (user) setOpen(false);
    else setOpen(true);
  }, [user]);

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body className="font-body antialiased">
        <Providers>
          <SidebarProvider>
            <Sidebar>
              <SidebarHeader>
                <Logo />
              </SidebarHeader>
              <SidebarContent className="p-0">
                <MainNav />
              </SidebarContent>
            </Sidebar>
            <SidebarInset>
              <header className="flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
                <SidebarTrigger
                  variant="outline"
                  size="icon"
                  className="shrink-0 md:hidden"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M4 6h16" />
                    <path d="M4 12h16" />
                    <path d="M4 18h16" />
                  </svg>
                  <span className="sr-only">Toggle navigation menu</span>
                </SidebarTrigger>
                <div className="w-full flex-1">
                  {/* Optional header content */}
                </div>
                <UserNav />
              </header>
              {/* Auth Dialog Popup */}
              <Dialog open={open}>
                <DialogContent>
                  <div className="flex flex-col items-center gap-4">
                    <h2 className="text-xl font-semibold">Sign in to ProspectorAI</h2>
                    <Button onClick={signInWithGoogle} className="w-full max-w-xs">
                      Continue with Google
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              {/* Main App Content */}
              <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
