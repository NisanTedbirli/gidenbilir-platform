'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, Home, PlusCircle, User } from 'lucide-react'
import { cn } from '@/lib/cn'

interface NavItem {
  href: string
  label: string
  icon: typeof Home
  highlight?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Ana Sayfa', icon: Home },
  { href: '/discover', label: 'Keşfet', icon: Compass },
  { href: '/share', label: 'Paylaş', icon: PlusCircle, highlight: true },
  { href: '/profile/me', label: 'Profil', icon: User },
]

/**
 * Mobil ve tablet için alt navigasyon (lg breakpoint altında).
 * Mobil app'in TabBar'ına benzer ama web ergonomisine uyarlanmış.
 */
export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Mobil ana navigasyon"
      className="fixed inset-x-0 bottom-0 z-sticky border-t border-border bg-bg-surface lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon, highlight }) => {
          const active =
            href === '/' ? pathname === '/' : pathname.startsWith(href.split('/').slice(0, 2).join('/'))
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-sm text-[11px] font-bold uppercase tracking-wider transition-colors',
                  active
                    ? 'text-primary'
                    : 'text-text-sub hover:text-text',
                  highlight && 'text-primary',
                )}
              >
                {highlight ? (
                  <span
                    aria-hidden="true"
                    className="flex size-10 items-center justify-center rounded-full text-white shadow-md"
                    style={{ backgroundImage: 'var(--gradient-primary)' }}
                  >
                    <Icon size={22} strokeWidth={2.2} />
                  </span>
                ) : (
                  <Icon aria-hidden="true" size={22} strokeWidth={active ? 2.2 : 1.8} />
                )}
                <span>{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
