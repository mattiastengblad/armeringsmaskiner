import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { CONTACT } from '@/lib/nav';
import { SITE_URL } from '@/lib/site-config';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Armeringsmaskiner.se – Bock- och klippmaskiner för armeringsjärn',
    template: '%s | Armeringsmaskiner.se',
  },
  description:
    'GMS bock- och klippmaskiner samt Oguras handhållna armeringsverktyg. Kontakta Per Lindgren för offert.',
  openGraph: {
    type: 'website',
    locale: 'sv_SE',
    siteName: 'Armeringsmaskiner.se',
    url: SITE_URL,
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: CONTACT.company,
  url: SITE_URL,
  telephone: CONTACT.phone,
  email: CONTACT.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: CONTACT.address,
    addressCountry: 'SE',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, '\\u003c'),
          }}
        />
        <a
          href="#main-content"
          className="focus:bg-background focus:text-foreground sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:border focus:px-4 focus:py-2"
        >
          Hoppa till innehåll
        </a>
        <SiteHeader />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
