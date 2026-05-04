import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  Show,
  UserButton,
} from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Lifting Diary',
  description: 'Track your lifting progress',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} dark h-full antialiased`}
    >
      <body className="font-(family-name:--font-inter) min-h-full flex flex-col">
        <ClerkProvider>
          <header className="flex items-center justify-between px-6 py-3 border-b border-border">
            <span className="text-lg font-bold tracking-tight">Lifting Diary</span>
            <div className="flex items-center gap-2">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <Button variant="outline" size="sm">Sign In</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm">Sign Up</Button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </div>
          </header>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
