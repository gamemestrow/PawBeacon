import type { Metadata } from 'next';
import { DM_Sans, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'PawBeacon — Animal-Care Discovery Platform',
  description:
    'Find trusted veterinary clinics, 24/7 animal hospitals, boarding facilities, diagnostic labs, pet ambulances, and animal NGOs near you.',
  openGraph: {
    title: 'PawBeacon — Animal-Care Discovery Platform',
    description:
      'Find trusted veterinary clinics, 24/7 animal hospitals, boarding facilities, diagnostic labs, pet ambulances, and animal NGOs near you.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-[#FFFDF7] text-[#1C1917] antialiased selection:bg-[#FDE047] selection:text-[#1C1917]">
        {children}
      </body>
    </html>
  );
}
