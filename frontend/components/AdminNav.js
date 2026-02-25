'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { href: '/admin', label: 'Tableau de bord', icon: DashboardIcon },
  { href: '/admin/produits', label: 'Produits', icon: ProductsIcon },
  { href: '/admin/categories', label: 'Catégories', icon: CategoriesIcon },
  { href: '/admin/commandes', label: 'Commandes', icon: OrdersIcon },
  { href: '/admin/discussions', label: 'Discussion', icon: DiscussionIcon },
  { href: '/admin/utilisateurs', label: 'Compte', icon: UserIcon },
];

function DashboardIcon() {
  return (
    <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}
function ProductsIcon() {
  return (
    <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}
function OrdersIcon() {
  return (
    <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-1.607-1.342-2.912-3-2.912H3c-1.658 0-3 1.305-3 2.912v7.294A2.25 2.25 0 003.75 18h.75m9-12.177v.958c0 1.607 1.342 2.912 3 2.912h3.75c1.658 0 3-1.305 3-2.912V7.75" />
    </svg>
  );
}
function CategoriesIcon() {
  return (
    <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318a2.25 2.25 0 00.879 1.828l7.5 5.25a2.25 2.25 0 002.742 0l7.5-5.25a2.25 2.25 0 00.879-1.828V5.25a2.25 2.25 0 00-2.25-2.25H14.432m-4.932 0a2.25 2.25 0 012.25 2.25v4.318a2.25 2.25 0 01-.879 1.828l-7.5 5.25a2.25 2.25 0 01-2.742 0l-7.5-5.25A2.25 2.25 0 013 9.568V5.25a2.25 2.25 0 012.25-2.25h4.318z" />
    </svg>
  );
}
function DiscussionIcon() {
  return (
    <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v3.75M15.75 9l-3-3m0 0l-3 3m3-3h8.25M9 15.75v3.75m0-3.75v-3.75m0 3.75H4.125" />
    </svg>
  );
}

export default function AdminNav() {
  const pathname = usePathname() || '';
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== 'undefined') localStorage.removeItem('urbans_token');
    router.push('/compte');
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-urbans-stone/60 bg-urbans-sand/95 backdrop-blur-md py-2 px-2"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0.5rem), 0.5rem)' }}
      aria-label="Navigation admin"
    >
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-center transition-colors ${isActive ? 'text-urbans-gold' : 'text-urbans-warm/70 hover:text-urbans-warm'}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
      <button
        type="button"
        onClick={handleLogout}
        className="flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-center text-urbans-warm/70 transition-colors hover:text-urbans-warm"
        aria-label="Déconnexion"
      >
        <LogoutIcon />
        <span className="text-[10px] font-medium">Déconnexion</span>
      </button>
    </nav>
  );
}
