import type { Metadata } from 'next';
import { Toaster } from '@/app/components/ui/toaster';
import '@mysten/dapp-kit/dist/index.css';
import './globals.css';
import { Providers } from '@/app/components/providers';

export const metadata: Metadata = {
  title: 'SuiPlay Marketplace',
  description: 'Mint and trade game item NFTs on the SUI blockchain. A world-class Web3 marketplace experience.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0A0A0F" />
        
        {/* ito yung Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Sora:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>

      {/* ito naman yung body of the website  */}
      <body className="h-full antialiased" style={{ fontFamily: 'var(--font-body)' }}>
        <Providers>
          <div className="flex h-full min-h-screen flex-col bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
            {children}
          </div>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
