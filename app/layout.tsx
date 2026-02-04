import type { Metadata } from 'next';
import { Toaster } from '@/app/components/ui/toaster';
import '@mysten/dapp-kit/dist/index.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'SuiPlay Marketplace',
  description: 'Mint and trade game item NFTs on the SUI blockchain.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
