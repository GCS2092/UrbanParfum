import './globals.css';
import { Playfair_Display } from 'next/font/google';
import AdminRedirect from '../components/AdminRedirect';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';
import Providers from '../components/Providers';
import LangSync from '../components/LangSync';

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

export const metadata = {
  title: 'UrbanS – Parfums & signatures olfactives',
  description: 'Découvrez une nouvelle manière de choisir votre parfum. Fragrances uniques, inspirées par l\'émotion et l\'élégance.',
  icons: { icon: '/icon.svg', type: 'image/svg+xml' },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'UrbanS',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#c9a96e',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`scroll-smooth ${playfair.variable}`}>
      <body className="min-w-0 font-sans">
        <Providers>
          <LangSync />
          <AdminRedirect />
          <Header />
          <main className="min-h-[80vh] pb-24">{children}</main>
          <Footer />
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}