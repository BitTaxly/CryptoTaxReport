import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import LegalAcceptanceModal from '@/components/LegalAcceptanceModal';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BitTaxly - Crypto Tax Reporting Tool',
  description: 'Free cryptocurrency tax reporting tool. Analyze your crypto wallet holdings and generate tax reports. GDPR compliant and secure.',
  keywords: ['crypto', 'tax', 'reporting', 'blockchain', 'wallet', 'bitcoin', 'ethereum', 'defi', 'gdpr'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <LegalAcceptanceModal />
          <main className="min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
